import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import { estimateNetMonthly, calculateUcPayment, type IncomeType } from "@/lib/income-logic";
import { eq } from "drizzle-orm";
import { logError } from "@/lib/logger";

type IncomeWithNet = {
  id: number;
  name: string;
  type: IncomeType;
  amount: number;
  hoursPerWeek: number | null;
  netMonthly: number;
};

type IncomeCategory = "wage" | "benefit" | "uc" | "disability_pension" | "side_gig" | "second_job" | "other";
type PaymentFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

const allowedTypes: IncomeType[] = ["hourly", "monthly_net", "yearly_gross", "uc"];
const allowedCategories: IncomeCategory[] = ["wage", "benefit", "uc", "disability_pension", "side_gig", "second_job", "other"];
const allowedFrequencies: PaymentFrequency[] = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"];

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const incomes = await db.query.incomeTable.findMany({
      where: eq(incomeTable.userId, session.user.id),
    });

    const enriched: IncomeWithNet[] = incomes.map((income) => ({
      ...income,
      netMonthly: estimateNetMonthly({
        type: income.type as IncomeType,
        amount: income.amount,
        hoursPerWeek: income.hoursPerWeek,
      }),
    }));

    const ucCandidate =
      enriched.find((inc) => inc.type === "uc") ||
      enriched.find((inc) => inc.name.toLowerCase().includes("universal"));

    const ucBase = ucCandidate ? ucCandidate.netMonthly : Number(process.env.UC_BASE_MONTHLY ?? 0);
    const taperIgnore = Number(process.env.UC_TAPER_DISREGARD ?? 411);
    const taperRate = Number(process.env.UC_TAPER_RATE ?? 0.55);
    const ucPayment = calculateUcPayment({
      incomes: enriched,
      base: ucBase,
      taperIgnore,
      taperRate,
    });

    const incomesWithoutUc = enriched.filter((inc) => inc !== ucCandidate && inc.type !== "uc");
    const totalNetMonthly = incomesWithoutUc.reduce((sum, inc) => sum + inc.netMonthly, 0);
    const incomesWithAdjustedUc = [
      ...incomesWithoutUc,
      ...(ucCandidate || ucBase
        ? [
            {
              ...(ucCandidate ?? {
                id: -1,
                name: "Universal Credit",
                type: "uc" as IncomeType,
                amount: ucBase,
                hoursPerWeek: null,
              }),
              netMonthly: ucPayment,
            },
          ]
        : []),
    ];

    return Response.json({
      summary: {
        totalNetMonthly,
        ucPayment,
      },
      incomes: incomesWithAdjustedUc,
    });
  } catch (error) {
    logError("GET /api/incomes failed", error);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, type, amount, hoursPerWeek, category, frequency, paymentDay } = body as Partial<{
      name: string;
      type: IncomeType;
      amount: number;
      hoursPerWeek: number;
      category: IncomeCategory;
      frequency: PaymentFrequency;
      paymentDay: number;
    }>;

    if (!name || name.length > 255 || !type || !allowedTypes.includes(type)) {
      return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return Response.json({ error: "Amount must be greater than zero." }, { status: 400 });
    }

    const safeCategory = allowedCategories.includes(category as IncomeCategory) ? (category as IncomeCategory) : "wage";
    const safeFrequency = allowedFrequencies.includes(frequency as PaymentFrequency)
      ? (frequency as PaymentFrequency)
      : "monthly";
    const safePaymentDay =
      Number.isInteger(Number(paymentDay)) && Number(paymentDay) >= 1 && Number(paymentDay) <= 31
        ? Number(paymentDay)
        : null;

    await db.insert(incomeTable).values({
      name,
      type,
      amount: Number(amount),
      hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
      category: safeCategory,
      frequency: safeFrequency,
      paymentDay: safePaymentDay,
      userId: session.user.id,
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    logError("POST /api/incomes failed", error);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
