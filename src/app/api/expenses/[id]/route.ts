import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { expenseTable, expenseFrequencyEnum } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { logError } from "@/lib/logger";
import {
  deriveCategory,
  formatExpenseAmounts,
  isExpenseCategory,
  isExpenseType,
  normalizeCurrency,
  type ExpenseCategory,
  type ExpenseFrequency,
  type ExpenseType,
  ucEligibleSubcategories,
} from "@/lib/expenses";

const allowedFrequencies: ExpenseFrequency[] = expenseFrequencyEnum.enumValues;

function safeDay(value?: number | null) {
  if (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31) {
    return Number(value);
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let expenseId: number | null = null;
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

    const { id } = await params;
    expenseId = Number(id);
    if (!Number.isInteger(expenseId)) {
      return Response.json({ error: "Invalid expense id" }, { status: 400 });
    }

    const expenseRaw = await db.query.expenseTable.findFirst({
      where: and(eq(expenseTable.id, expenseId), eq(expenseTable.userId, session.user.id)),
    });

    if (!expenseRaw) {
      return Response.json({ error: "Expense not found" }, { status: 404 });
    }

    const { monthlyAmount, monthlyOutOfPocket } = formatExpenseAmounts({
      amount: Number(expenseRaw.amount),
      frequency: expenseRaw.frequency as ExpenseFrequency,
      paidByUc: expenseRaw.paidByUc,
    });

    return Response.json({
      ...expenseRaw,
      amount: Number(expenseRaw.amount),
      category: expenseRaw.category as ExpenseCategory,
      frequency: expenseRaw.frequency as ExpenseFrequency,
      monthlyAmount,
      monthlyOutOfPocket,
    });
  } catch (error) {
    logError("GET /api/expenses/[id] failed", error, { expenseId, userId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let expenseId: number | null = null;
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

    const { id } = await params;
    expenseId = Number(id);
    if (!Number.isInteger(expenseId)) {
      return Response.json({ error: "Invalid expense id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, type, amount, category, frequency, paymentDay, paidByUc } = body as Partial<{
      name: string;
      type: ExpenseType;
      amount: number;
      category: ExpenseCategory;
      frequency: ExpenseFrequency;
      paymentDay: number;
      paidByUc: boolean;
    }>;

    if (!name || name.length > 255 || !type || !isExpenseType(type)) {
      return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
    }

    const safeAmount = normalizeCurrency(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      return Response.json({ error: "Amount must be greater than zero." }, { status: 400 });
    }

    const safeFrequency = allowedFrequencies.includes(frequency as ExpenseFrequency)
      ? (frequency as ExpenseFrequency)
      : "monthly";
    const safeCategory = deriveCategory(
      isExpenseCategory(category) ? category : null,
      type
    );
    const safePaymentDay = safeDay(paymentDay);
    const paidByUcValue = Boolean(paidByUc) && ucEligibleSubcategories.includes(type);

    const updated = await db
      .update(expenseTable)
      .set({
        name,
        type,
        amount: safeAmount,
        category: safeCategory,
        frequency: safeFrequency,
        paymentDay: safePaymentDay,
        paidByUc: paidByUcValue,
      })
      .where(and(eq(expenseTable.id, expenseId), eq(expenseTable.userId, session.user.id)))
      .returning();

    if (updated.length === 0) {
      return Response.json({ error: "Expense not found" }, { status: 404 });
    }

    return Response.json(updated[0]);
  } catch (error) {
    logError("PUT /api/expenses/[id] failed", error, { expenseId, userId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let expenseId: number | null = null;
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

    const { id } = await params;
    expenseId = Number(id);
    if (!Number.isInteger(expenseId)) {
      return Response.json({ error: "Invalid expense id" }, { status: 400 });
    }

    const deleted = await db
      .delete(expenseTable)
      .where(and(eq(expenseTable.id, expenseId), eq(expenseTable.userId, session.user.id)))
      .returning({ id: expenseTable.id });

    if (deleted.length === 0) {
      return Response.json({ error: "Expense not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    logError("DELETE /api/expenses/[id] failed", error, { expenseId, userId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
