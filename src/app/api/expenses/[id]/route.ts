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
  | "other";

const allowed: ExpenseType[] = [
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
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const expenseId = Number(id);
  if (!Number.isInteger(expenseId)) {
    return Response.json({ error: "Invalid expense id" }, { status: 400 });
  }

  const body = await req.json();
  const { name, type, amount } = body as Partial<{
    name: string;
    type: ExpenseType;
    amount: number;
  }>;

  if (!name || !type || !allowed.includes(type)) {
    return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return Response.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  const updated = await db
    .update(expenseTable)
    .set({
      name,
      type,
      amount: Number(amount),
    })
    .where(and(eq(expenseTable.id, expenseId), eq(expenseTable.userId, session.user.id)))
    .returning();

  if (updated.length === 0) {
    return Response.json({ error: "Expense not found" }, { status: 404 });
  }

  return Response.json(updated[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
