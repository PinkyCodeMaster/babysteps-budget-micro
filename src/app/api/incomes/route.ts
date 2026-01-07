import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { expenseTable, incomeTable } from "@/db/schema";
import {
  estimateNetMonthly,
  calculateUcPayment,
  normalizeIncomeAmount,
  incomeTypeFromBasis,
  defaultHoursGuess,
  type IncomeBasis,
  type IncomeCategory,
  type IncomeType,
  type PaymentDayRule,
  type PaymentFrequency,
} from "@/lib/income-logic";
import { eq } from "drizzle-orm";
import { logError } from "@/lib/logger";
import { formatExpenseAmounts, type ExpenseFrequency } from "@/lib/expenses";

type IncomeWithNet = {
  id: number;
  name: string;
  type: IncomeType;
  amount: number;
  hoursPerWeek: number | null;
  category?: IncomeCategory | null;
  frequency?: PaymentFrequency | null;
  netMonthly: number;
};

const allowedCategories: IncomeCategory[] = ["wage", "benefit", "uc", "disability_pension", "side_gig", "second_job", "other"];
const allowedFrequencies: PaymentFrequency[] = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"];
const allowedRules: PaymentDayRule[] = ["specific_day", "last_working_day", "last_friday", "last_thursday"];
const allowedBases: IncomeBasis[] = [
  "monthly_net",
  "weekly_net",
  "fortnightly_net",
  "four_weekly_net",
  "yearly_gross",
  "hourly",
  "uc",
];

function resolveBasis({
  explicitBasis,
  type,
  frequency,
}: {
  explicitBasis?: IncomeBasis | null;
  type?: IncomeType | null;
  frequency?: PaymentFrequency | null;
}): IncomeBasis {
  if (explicitBasis && allowedBases.includes(explicitBasis)) {
    return explicitBasis;
  }

  if (type === "yearly_gross") return "yearly_gross";
  if (type === "hourly") return "hourly";
  if (type === "uc") return "uc";

  switch (frequency) {
    case "weekly":
      return "weekly_net";
    case "fortnightly":
      return "fortnightly_net";
    case "four_weekly":
      return "four_weekly_net";
    default:
      return "monthly_net";
  }
}

function normalizeAmountForStorage(amount: number, basis: IncomeBasis) {
  const normalized = normalizeIncomeAmount(amount, basis);
  return Math.round(normalized * 100) / 100;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const incomes = await db.query.incomeTable.findMany({
      where: eq(incomeTable.userId, session.user.id),
    });

    const enriched: IncomeWithNet[] = incomes.map((income) => {
      const rawAmount = Number(income.amount);
      const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
      const rawHours = income.hoursPerWeek === null ? null : Number(income.hoursPerWeek);
      const hoursPerWeek =
        income.type === "hourly"
          ? rawHours !== null && Number.isFinite(rawHours) && rawHours > 0
            ? rawHours
            : defaultHoursGuess
          : rawHours !== null && Number.isFinite(rawHours)
            ? rawHours
            : null;
      return {
        ...income,
        amount,
        hoursPerWeek,
        netMonthly: estimateNetMonthly({
          type: income.type as IncomeType,
          amount,
          hoursPerWeek,
        }),
      };
    });

    const ucCandidate =
      enriched.find((inc) => inc.type === "uc") ||
      enriched.find((inc) => inc.name.toLowerCase().includes("universal")) ||
      enriched.find((inc) => inc.name.toLowerCase().includes("uc")) ||
      enriched.find((inc) => (inc.category ?? "").toLowerCase() === "uc");

    const baseFromEnv = Number(process.env.UC_BASE_MONTHLY ?? 0);
    const disregardFromEnv = Number(process.env.UC_TAPER_DISREGARD ?? 411);
    const taperRateFromEnv = Number(process.env.UC_TAPER_RATE ?? 0.55);
    const ucBaseEnv = Number.isFinite(baseFromEnv) ? baseFromEnv : 0;
    const taperIgnore = Number.isFinite(disregardFromEnv) ? disregardFromEnv : 411;
    const taperRate = Number.isFinite(taperRateFromEnv) ? taperRateFromEnv : 0.55;
    const ucBase =
      ucCandidate && Number.isFinite(ucCandidate.netMonthly) ? ucCandidate.netMonthly : ucBaseEnv;
    const expenses = await db.query.expenseTable.findMany({
      where: eq(expenseTable.userId, session.user.id),
    });
    const paidByUcMonthly = expenses
      .filter((exp) => exp.paidByUc)
      .reduce((sum, exp) => {
        const { monthlyAmount } = formatExpenseAmounts({
          amount: Number(exp.amount),
          frequency: exp.frequency as ExpenseFrequency,
          paidByUc: exp.paidByUc,
        });
        return sum + monthlyAmount;
      }, 0);

    const ucPayment = calculateUcPayment({
      incomes: enriched,
      base: ucBase,
      taperIgnore,
      taperRate,
      paidByUcMonthly,
    });

    const incomesWithoutUc = enriched.filter((inc) => inc !== ucCandidate && inc.type !== "uc");
    const totalNetMonthly = incomesWithoutUc.reduce(
      (sum, inc) => sum + (Number.isFinite(inc.netMonthly) ? inc.netMonthly : 0),
      0
    );
    const ucPaymentSafe = Number.isFinite(ucPayment) ? ucPayment : 0;
    const incomesWithAdjustedUc = [
      ...incomesWithoutUc,
      ...(ucCandidate || ucBase
        ? [
            {
              ...(ucCandidate ?? {
                id: -1,
                name: "Universal Credit",
                type: "uc" as IncomeType,
                category: "uc" as IncomeCategory,
                frequency: "monthly" as PaymentFrequency,
                amount: ucBase,
                hoursPerWeek: null,
              }),
              netMonthly: ucPaymentSafe,
            },
          ]
        : []),
    ];

    return Response.json({
      summary: {
        totalNetMonthly,
        ucPayment: ucPaymentSafe,
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
    const { name, type, amount, hoursPerWeek, category, frequency, paymentDay, paymentDayRule, amountBasis } =
      body as Partial<{
        name: string;
        type: IncomeType;
        amount: number;
        hoursPerWeek: number;
        category: IncomeCategory;
        frequency: PaymentFrequency;
        paymentDay: number;
        paymentDayRule: PaymentDayRule;
        amountBasis: IncomeBasis;
      }>;

    if (!name || name.length > 255) {
      return Response.json({ error: "Please provide a name (max 255 chars)." }, { status: 400 });
    }

    const resolvedBasis = resolveBasis({
      explicitBasis: (amountBasis as IncomeBasis | undefined) ?? null,
      type: type ?? null,
      frequency: frequency ?? null,
    });
    const resolvedType = incomeTypeFromBasis(resolvedBasis);

    const safeAmount = Number(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      return Response.json({ error: "Amount must be greater than zero." }, { status: 400 });
    }

    const normalizedAmount = normalizeAmountForStorage(safeAmount, resolvedBasis);

    const needsHours = resolvedBasis === "hourly";
    const safeHoursRaw = needsHours ? Math.round(Number(hoursPerWeek ?? defaultHoursGuess) * 100) / 100 : null;
    const safeHours = needsHours && (!safeHoursRaw || safeHoursRaw <= 0) ? defaultHoursGuess : safeHoursRaw;

    const safeCategory = allowedCategories.includes(category as IncomeCategory) ? (category as IncomeCategory) : "wage";
    const safeFrequency: PaymentFrequency =
      resolvedType === "uc"
        ? "monthly"
        : allowedFrequencies.includes(frequency as PaymentFrequency)
          ? (frequency as PaymentFrequency)
          : "monthly";
    const safeRule = allowedRules.includes(paymentDayRule as PaymentDayRule)
      ? (paymentDayRule as PaymentDayRule)
      : "specific_day";
    const safePaymentDay =
      safeRule === "specific_day" &&
      Number.isInteger(Number(paymentDay)) &&
      ((safeFrequency === "weekly" && Number(paymentDay) >= 1 && Number(paymentDay) <= 7) ||
        (safeFrequency !== "weekly" && Number(paymentDay) >= 1 && Number(paymentDay) <= 31))
        ? Number(paymentDay)
        : null;

    await db.insert(incomeTable).values({
      name,
      type: resolvedType,
      amount: normalizedAmount,
      hoursPerWeek: safeHours,
      category: safeCategory,
      frequency: safeFrequency,
      paymentDay: safePaymentDay,
      paymentDayRule: safeRule,
      userId: session.user.id,
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    logError("POST /api/incomes failed", error);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
