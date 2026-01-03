import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import { estimateNetMonthly, type IncomeType } from "@/lib/income-logic";
import { and, eq } from "drizzle-orm";
import { logError } from "@/lib/logger";

type IncomeCategory = "wage" | "benefit" | "uc" | "disability_pension" | "side_gig" | "second_job" | "other";
type PaymentFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

const allowedTypes: IncomeType[] = ["hourly", "monthly_net", "yearly_gross", "uc"];
const allowedCategories: IncomeCategory[] = ["wage", "benefit", "uc", "disability_pension", "side_gig", "second_job", "other"];
const allowedFrequencies: PaymentFrequency[] = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"];

function safeDay(value?: number | null) {
  if (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31) {
    return Number(value);
  }
  return null;
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

    const netMonthly = estimateNetMonthly({
      type: income.type as IncomeType,
      amount: income.amount,
      hoursPerWeek: income.hoursPerWeek,
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
    const { name, type, amount, hoursPerWeek, category, frequency, paymentDay } = body as Partial<{
      name: string;
      type: IncomeType;
      amount: number;
      hoursPerWeek: number | null;
      category: IncomeCategory;
      frequency: PaymentFrequency;
      paymentDay: number | null;
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

    const updated = await db
      .update(incomeTable)
      .set({
        name,
        type,
        amount: Number(amount),
        hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
        category: safeCategory,
        frequency: safeFrequency,
        paymentDay: safeDay(paymentDay),
      })
      .where(and(eq(incomeTable.id, incomeId), eq(incomeTable.userId, session.user.id)))
      .returning();

    if (updated.length === 0) {
      return Response.json({ error: "Income not found" }, { status: 404 });
    }

    const income = updated[0];
    const netMonthly = estimateNetMonthly({
      type: income.type as IncomeType,
      amount: income.amount,
      hoursPerWeek: income.hoursPerWeek,
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
