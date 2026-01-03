import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import { estimateNetMonthly, calculateUcPayment, type IncomeType } from "@/lib/income-logic";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const incomes = await db.query.incomeTable.findMany({
    where: eq(incomeTable.userId, session.user.id),
  });

  const enriched = incomes.map((income) => {
    const netMonthly = estimateNetMonthly({
      type: income.type as IncomeType,
      amount: income.amount,
      hoursPerWeek: income.hoursPerWeek,
    });
    return { ...income, netMonthly };
  });

  const totalNetMonthly = enriched.reduce((sum, inc) => sum + inc.netMonthly, 0);

  const ucBase = Number(process.env.UC_BASE_MONTHLY ?? 0);
  const taperIgnore = Number(process.env.UC_TAPER_DISREGARD ?? 411);
  const taperRate = Number(process.env.UC_TAPER_RATE ?? 0.55);
  const ucPayment = calculateUcPayment({
    incomes: enriched,
    base: ucBase,
    taperIgnore,
    taperRate,
  });

  return Response.json({
    summary: {
      totalNetMonthly,
      ucPayment,
    },
    incomes: enriched,
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, type, amount, hoursPerWeek } = body as Partial<{
    name: string;
    type: IncomeType;
    amount: number;
    hoursPerWeek: number;
  }>;

  const allowed: IncomeType[] = ["hourly", "monthly_net", "yearly_gross", "uc"];

  if (!name || !type || !allowed.includes(type)) {
    return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return Response.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  await db.insert(incomeTable).values({
    name,
    type,
    amount: Number(amount),
    hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
    userId: session.user.id,
  });

  return Response.json({ success: true }, { status: 201 });
}
