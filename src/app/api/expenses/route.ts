import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { expenseTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, session.user.id),
  });

  const totalMonthly = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return Response.json({
    summary: { totalMonthly },
    expenses,
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
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

  await db.insert(expenseTable).values({
    name,
    type,
    amount: Number(amount),
    userId: session.user.id,
  });

  return Response.json({ success: true }, { status: 201 });
}
