import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { expenseTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type ExpenseType =
  | "housing"
  | "utilities"
  | "transport"
  | "food"
  | "childcare"
  | "insurance"
  | "subscriptions"
  | "medical"
  | "education"
  | "entertainment"
  | "savings"
  | "other"
  | "rent"
  | "service_charge"
  | "council_tax"
  | "gas"
  | "electric"
  | "water"
  | "car_fuel"
  | "groceries"
  | "phone"
  | "internet";

type ExpenseCategory = ExpenseType;
type ExpenseFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

const allowedTypes: ExpenseType[] = [
  "housing",
  "utilities",
  "transport",
  "food",
  "childcare",
  "insurance",
  "subscriptions",
  "medical",
  "education",
  "entertainment",
  "savings",
  "other",
  "rent",
  "service_charge",
  "council_tax",
  "gas",
  "electric",
  "water",
  "car_fuel",
  "groceries",
  "phone",
  "internet",
];

const allowedCategories: ExpenseCategory[] = allowedTypes;
const allowedFrequencies: ExpenseFrequency[] = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"];

function safeDay(value?: number | null) {
  if (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31) {
    return Number(value);
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const expenseId = Number(id);
  if (!Number.isInteger(expenseId)) {
    return Response.json({ error: "Invalid expense id" }, { status: 400 });
  }

  const expense = await db.query.expenseTable.findFirst({
    where: and(eq(expenseTable.id, expenseId), eq(expenseTable.userId, session.user.id)),
  });

  if (!expense) {
    return Response.json({ error: "Expense not found" }, { status: 404 });
  }

  return Response.json(expense);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const expenseId = Number(id);
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

  if (!name || name.length > 255 || !type || !allowedTypes.includes(type)) {
    return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return Response.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  const safeCategory = allowedCategories.includes(category as ExpenseCategory) ? (category as ExpenseCategory) : "other";
  const safeFrequency = allowedFrequencies.includes(frequency as ExpenseFrequency)
    ? (frequency as ExpenseFrequency)
    : "monthly";
  const safePaymentDay = safeDay(paymentDay);
  const paidByUcValue = Boolean(paidByUc);

  const updated = await db
    .update(expenseTable)
    .set({
      name,
      type,
      amount: Number(amount),
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
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const expenseId = Number(id);
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
}
