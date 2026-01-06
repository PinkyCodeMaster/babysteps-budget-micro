import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { expenseTable, expenseFrequencyEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logError } from "@/lib/logger";
import {
  deriveCategory,
  formatExpenseAmounts,
  isExpenseCategory,
  isExpenseType,
  normalizeCurrency,
  ucEligibleSubcategories,
  type ExpenseFrequency,
  type ExpenseType,
  type ExpenseCategory,
} from "@/lib/expenses";

const allowedFrequencies: ExpenseFrequency[] = expenseFrequencyEnum.enumValues;

function safeDay(value?: number | null) {
  if (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31) {
    return Number(value);
  }
  return null;
}

export async function GET() {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

    const expensesRaw = await db.query.expenseTable.findMany({
      where: eq(expenseTable.userId, session.user.id),
    });

    const expenses = expensesRaw.map((exp) => {
      const amount = Number(exp.amount);
      const frequency = exp.frequency as ExpenseFrequency;
      const category = exp.category as ExpenseCategory;
      const { monthlyAmount, monthlyOutOfPocket } = formatExpenseAmounts({
        amount,
        frequency,
        paidByUc: exp.paidByUc,
      });
      return {
        ...exp,
        amount,
        category,
        frequency,
        monthlyAmount,
        monthlyOutOfPocket,
      };
    });

    const totalMonthly = expenses.reduce((sum, exp) => sum + exp.monthlyOutOfPocket, 0);
    const ucCovered = expenses.reduce((sum, exp) => sum + (exp.paidByUc ? exp.monthlyAmount : 0), 0);

    return Response.json({
      summary: { totalMonthly, ucCoveredMonthly: ucCovered },
      expenses,
    });
  } catch (error) {
    logError("GET /api/expenses failed", error, { userId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

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
    const paidByUcValue = ucEligibleSubcategories.includes(type) && Boolean(paidByUc);

    await db.insert(expenseTable).values({
      name,
      type,
      amount: safeAmount,
      category: safeCategory,
      frequency: safeFrequency,
      paymentDay: safePaymentDay,
      paidByUc: paidByUcValue,
      userId: session.user.id,
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    logError("POST /api/expenses failed", error, { userId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
