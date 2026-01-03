import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type DebtParams = { params: Promise<{ id: string }> };
type ParsedId = { debtId: number } | { error: Response };

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
  const { name, type, balance, interestRate, minimumPayment } = body;

  // Only apply fields that were supplied by the client.
  const updates: Partial<typeof debtTable.$inferInsert> = {};

  if (name !== undefined) updates.name = name;
  if (type !== undefined) updates.type = type;
  if (balance !== undefined) {
    if (balance <= 0) {
      return Response.json(
        { error: "Balance must be greater than zero" },
        { status: 400 }
      );
    }
    updates.balance = balance;
  }
  if (interestRate !== undefined) updates.interestRate = interestRate;
  if (minimumPayment !== undefined) {
    if (minimumPayment <= 0) {
      return Response.json(
        { error: "Minimum payment must be greater than zero" },
        { status: 400 }
      );
    }
    updates.minimumPayment = minimumPayment;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json(
      { error: "No fields provided to update" },
      { status: 400 }
    );
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
