import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type DebtParams = { params: Promise<{ id: string }> };
type ParsedId = { debtId: number } | { error: Response };

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

// Validate the dynamic segment up front to keep handlers small.
function parseDebtId(id: string): ParsedId {
  const debtId = Number(id);

  if (Number.isNaN(debtId)) {
    return { error: Response.json({ error: "Invalid debt id" }, { status: 400 }) };
  }

  return { debtId };
}

// Shared lookup with derived totals so every handler returns consistent data.
async function fetchDebt(debtId: number, userId: string) {
  const debt = await db.query.debtTable.findFirst({
    where: and(eq(debtTable.id, debtId), eq(debtTable.userId, userId)),
    with: {
      payments: true,
    },
  });

  if (!debt) {
    return { error: Response.json({ error: "Debt not found" }, { status: 404 }) };
  }

  const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = debt.balance - totalPaid;

  return {
    data: {
      ...debt,
      totalPaid,
      remainingBalance,
    },
  };
}

export async function GET(_: NextRequest, { params }: DebtParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = parseDebtId(id);
  if ("error" in parsed) return parsed.error;
  const debtId = parsed.debtId;

  const debt = await fetchDebt(debtId, session.user.id);
  if (debt.error) return debt.error;

  return Response.json(debt.data);
}

export async function PATCH(request: NextRequest, { params }: DebtParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = parseDebtId(id);
  if ("error" in parsed) return parsed.error;
  const debtId = parsed.debtId;

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

  // Only apply fields that were supplied by the client.
  const updates: Partial<typeof debtTable.$inferInsert> = {};

  if (name !== undefined) {
    if (!name || name.length > 255) {
      return Response.json({ error: "Invalid name" }, { status: 400 });
    }
    updates.name = name;
  }

  if (type !== undefined) {
    if (!allowedTypes.includes(type)) {
      return Response.json({ error: "Invalid debt type" }, { status: 400 });
    }
    updates.type = type;
  }

  if (balance !== undefined) {
    if (!Number.isFinite(Number(balance)) || Number(balance) <= 0) {
      return Response.json({ error: "Balance must be greater than zero" }, { status: 400 });
    }
    updates.balance = Number(balance);
  }

  if (interestRate !== undefined) {
    updates.interestRate = interestRate === null ? null : Number(interestRate);
  }

  if (minimumPayment !== undefined) {
    if (!Number.isFinite(Number(minimumPayment)) || Number(minimumPayment) <= 0) {
      return Response.json({ error: "Minimum payment must be greater than zero" }, { status: 400 });
    }
    updates.minimumPayment = Number(minimumPayment);
  }

  if (frequency !== undefined) {
    if (!allowedFrequencies.includes(frequency as DebtFrequency)) {
      return Response.json({ error: "Invalid frequency" }, { status: 400 });
    }
    updates.frequency = frequency as DebtFrequency;
  }

  if (dueDay !== undefined) {
    const day = safeDay(dueDay);
    if (dueDay !== null && day === null) {
      return Response.json({ error: "Invalid due day" }, { status: 400 });
    }
    updates.dueDay = day;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields provided to update" }, { status: 400 });
  }

  updates.updated_at = new Date();

  // Ensure the record exists before updating.
  const existing = await fetchDebt(debtId, session.user.id);
  if (existing.error) return existing.error;

  await db
    .update(debtTable)
    .set(updates)
    .where(and(eq(debtTable.id, debtId), eq(debtTable.userId, session.user.id)));

  const updated = await fetchDebt(debtId, session.user.id);
  if (updated.error) return updated.error;

  return Response.json(updated.data);
}

export async function DELETE(_: NextRequest, { params }: DebtParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = parseDebtId(id);
  if ("error" in parsed) return parsed.error;
  const debtId = parsed.debtId;

  const existing = await fetchDebt(debtId, session.user.id);
  if (existing.error) return existing.error;

  await db
    .delete(debtTable)
    .where(and(eq(debtTable.id, debtId), eq(debtTable.userId, session.user.id)));

  return Response.json({ success: true });
}

export const PUT = PATCH;
