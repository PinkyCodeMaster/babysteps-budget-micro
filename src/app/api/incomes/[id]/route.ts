import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import {
  estimateNetMonthly,
  incomeTypeFromBasis,
  normalizeIncomeAmount,
  type IncomeType,
  type IncomeCategory,
  type PaymentFrequency,
  type PaymentDayRule,
  type IncomeBasis,
  defaultHoursGuess,
} from "@/lib/income-logic";
import { and, eq } from "drizzle-orm";
import { logError } from "@/lib/logger";

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

function safeDay(value?: number | null) {
  if (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31) {
    return Number(value);
  }
  return null;
}

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let incomeId: number | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    incomeId = Number(id);
    if (!Number.isInteger(incomeId)) {
      return Response.json({ error: "Invalid income id" }, { status: 400 });
    }

    const income = await db.query.incomeTable.findFirst({
      where: and(eq(incomeTable.id, incomeId), eq(incomeTable.userId, session.user.id)),
    });

    if (!income) {
      return Response.json({ error: "Income not found" }, { status: 404 });
    }

    const hours =
      income.type === "hourly"
        ? income.hoursPerWeek === null || Number(income.hoursPerWeek) <= 0
          ? defaultHoursGuess
          : Number(income.hoursPerWeek)
        : income.hoursPerWeek === null
          ? null
          : Number(income.hoursPerWeek);
    const netMonthly = estimateNetMonthly({
      type: income.type as IncomeType,
      amount: Number(income.amount),
      hoursPerWeek: hours,
    });

    return Response.json({ ...income, netMonthly });
  } catch (error) {
    logError("GET /api/incomes/[id] failed", error, { incomeId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let incomeId: number | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    incomeId = Number(id);
    if (!Number.isInteger(incomeId)) {
      return Response.json({ error: "Invalid income id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, type, amount, hoursPerWeek, category, frequency, paymentDay, paymentDayRule, amountBasis } =
      body as Partial<{
        name: string;
        type: IncomeType;
        amount: number;
        hoursPerWeek: number | null;
        category: IncomeCategory;
        frequency: PaymentFrequency;
        paymentDay: number | null;
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

    const updated = await db
      .update(incomeTable)
      .set({
        name,
        type: resolvedType,
        amount: normalizedAmount,
        hoursPerWeek: safeHours,
        category: safeCategory,
        frequency: safeFrequency,
        paymentDay:
          safeRule === "specific_day"
            ? safeDay(
                paymentDay !== null && paymentDay !== undefined
                  ? safeFrequency === "weekly"
                    ? paymentDay >= 1 && paymentDay <= 7
                      ? paymentDay
                      : null
                    : paymentDay
                  : null,
              )
            : null,
        paymentDayRule: safeRule,
        updated_at: new Date(),
      })
      .where(and(eq(incomeTable.id, incomeId), eq(incomeTable.userId, session.user.id)))
      .returning();

    if (updated.length === 0) {
      return Response.json({ error: "Income not found" }, { status: 404 });
    }

    const income = updated[0];
    const netMonthly = estimateNetMonthly({
      type: income.type as IncomeType,
      amount: Number(income.amount),
      hoursPerWeek: income.hoursPerWeek === null ? null : Number(income.hoursPerWeek),
    });

    return Response.json({ ...income, netMonthly });
  } catch (error) {
    logError("PUT /api/incomes/[id] failed", error, { incomeId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let incomeId: number | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    incomeId = Number(id);
    if (!Number.isInteger(incomeId)) {
      return Response.json({ error: "Invalid income id" }, { status: 400 });
    }

    const deleted = await db
      .delete(incomeTable)
      .where(and(eq(incomeTable.id, incomeId), eq(incomeTable.userId, session.user.id)))
      .returning({ id: incomeTable.id });

    if (deleted.length === 0) {
      return Response.json({ error: "Income not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    logError("DELETE /api/incomes/[id] failed", error, { incomeId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
