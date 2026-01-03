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

type ExpenseCategory = ExpenseType | "rent" | "service_charge" | "council_tax" | "gas" | "electric" | "water" | "car_fuel" | "groceries" | "phone" | "internet";
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

  await db.insert(expenseTable).values({
    name,
    type,
    amount: Number(amount),
    category: safeCategory,
    frequency: safeFrequency,
    paymentDay: safePaymentDay,
    paidByUc: paidByUcValue,
    userId: session.user.id,
  });

  return Response.json({ success: true }, { status: 201 });
}
