import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logError } from "@/lib/logger";
import { eq } from "drizzle-orm";

type DebtType =
  | "credit_card"
  | "personal_loan"
  | "loan"
  | "mortgage"
  | "car_finance"
  | "overdraft"
  | "payday"
  | "utility_arrears"
  | "council_tax"
  | "tax_arrears"
  | "student_loan"
  | "store_card"
  | "hire_purchase"
  | "ccj"
  | "uc_advance"
  | "old_phone_bill"
  | "rent_arrears"
  | "gas_arrears"
  | "electric_arrears"
  | "water_arrears"
  | "income_tax_arrears"
  | "other";

type DebtFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

const allowedTypes: DebtType[] = [
  "credit_card",
  "personal_loan",
  "loan",
  "mortgage",
  "car_finance",
  "overdraft",
  "payday",
  "utility_arrears",
  "council_tax",
  "tax_arrears",
  "student_loan",
  "store_card",
  "hire_purchase",
  "ccj",
  "uc_advance",
  "old_phone_bill",
  "rent_arrears",
  "gas_arrears",
  "electric_arrears",
  "water_arrears",
  "income_tax_arrears",
  "other",
];

const allowedFrequencies: DebtFrequency[] = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"];

function safeDay(value?: number | null) {
  if (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31) {
    return Number(value);
  }
  return null;
}

// List debts scoped to the signed-in user with payments and derived totals.
export async function GET() {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const debts = await db.query.debtTable.findMany({
      with: { payments: true },
      where: eq(debtTable.userId, session.user.id),
    });

    const enriched = debts.map((debt) => {
      const payments = debt.payments.map((payment) => {
        const rawAmount = Number(payment.amount);
        const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
        return { ...payment, amount };
      });

      const rawBalance = Number(debt.balance);
      const balance = Number.isFinite(rawBalance) ? rawBalance : 0;
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingBalance = balance - totalPaid;

      const rawRate = debt.interestRate === null ? null : Number(debt.interestRate);
      const interestRate = rawRate !== null && Number.isFinite(rawRate) ? rawRate : null;
      const rawMinimum = debt.minimumPayment === null ? null : Number(debt.minimumPayment);
      const minimumPayment = rawMinimum !== null && Number.isFinite(rawMinimum) ? rawMinimum : null;
      const rawDueDay = debt.dueDay === null || debt.dueDay === undefined ? null : Number(debt.dueDay);
      const dueDay = rawDueDay !== null && Number.isInteger(rawDueDay) ? rawDueDay : null;

      return {
        ...debt,
        balance,
        interestRate,
        minimumPayment,
        dueDay,
        totalPaid,
        remainingBalance,
        payments,
      };
    });

    return Response.json({ debts: enriched });
  } catch (error) {
    logError("GET /api/debts failed", error, { userId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// Creates a debt; numeric fields validated server-side and scoped to the signed-in user.
export async function POST(request: Request) {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const body = await request.json();

    const { name, type, balance, interestRate, minimumPayment, frequency, dueDay } = body as Partial<{
      name: string;
      type: DebtType;
      balance: number;
      interestRate: number | null;
      minimumPayment: number;
      frequency: DebtFrequency;
      dueDay: number | null;
    }>;

    if (!name || name.length > 255 || !type || !allowedTypes.includes(type)) {
      return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
    }

    const safeBalance = Math.round(Number(balance) * 100) / 100;
    if (!Number.isFinite(safeBalance) || safeBalance <= 0) {
      return Response.json({ error: "Please provide a valid balance." }, { status: 400 });
    }

    const safeMinimum =
      minimumPayment === undefined || minimumPayment === null
        ? null
        : Math.round(Number(minimumPayment) * 100) / 100;
    if (safeMinimum !== null && (!Number.isFinite(safeMinimum) || safeMinimum <= 0)) {
      return Response.json({ error: "Minimum payment must be greater than zero if provided." }, { status: 400 });
    }

    const safeFrequency = allowedFrequencies.includes(frequency as DebtFrequency) ? (frequency as DebtFrequency) : "monthly";
    const safeDueDay = safeDay(dueDay);

    const sanitized: typeof debtTable.$inferInsert = {
      name,
      type,
      balance: safeBalance,
      interestRate: interestRate === undefined || interestRate === null ? null : Math.round(Number(interestRate) * 100) / 100,
      minimumPayment: safeMinimum,
      frequency: safeFrequency,
      dueDay: safeDueDay,
      userId: session.user.id,
    };

    const [created] = await db
      .insert(debtTable)
      .values(sanitized)
      .returning({ id: debtTable.id });

    return Response.json({ id: created.id }, { status: 201 });
  } catch (error) {
    logError("POST /api/debts failed", error, { userId });
    return Response.json({ error: "We couldn't save that debt. Please try again." }, { status: 500 });
  }
}
