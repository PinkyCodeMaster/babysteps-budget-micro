import { db } from "@/db";
import { debtTable, paymentTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logError } from "@/lib/logger";

type ParsedId = { debtId: number } | { error: Response };

// Validate the debt id from the route.
function parseDebtId(id: string): ParsedId {
  const debtId = Number(id);
  if (Number.isNaN(debtId)) {
    return { error: Response.json({ error: "Invalid debt id" }, { status: 400 }) };
  }

  return { debtId };
}

// Fetch debt with payments and derive totals to simplify handler logic.
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

  return { data: debt, totalPaid, remainingBalance };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let debtId: number | null = null;
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

    const { id } = await params;
    const parsed = parseDebtId(id);
    if ("error" in parsed) return parsed.error;
    debtId = parsed.debtId;

    const debt = await fetchDebt(debtId, session.user.id);
    if (debt.error) return debt.error;

    return Response.json({
      payments: debt.data.payments,
      totalPaid: debt.totalPaid,
      remainingBalance: debt.remainingBalance,
    });
  } catch (error) {
    logError("GET /api/debts/[id]/payments failed", error, { debtId, userId });
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let debtId: number | null = null;
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

    const { id } = await params;
    const parsed = parseDebtId(id);
    if ("error" in parsed) return parsed.error;
    debtId = parsed.debtId;

    const body = await request.json();
    const { amount, paymentDate } = body;

    const amountValue = Number(amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return Response.json(
        { error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (paymentDate && Number.isNaN(Date.parse(paymentDate))) {
      return Response.json(
        { error: "Invalid payment date" },
        { status: 400 }
      );
    }

    // Get the current balance context to enforce overpayment guard.
    const debt = await fetchDebt(debtId, session.user.id);
    if (debt.error) return debt.error;

    if (amountValue > debt.remainingBalance) {
      return Response.json(
        { error: "Payment exceeds remaining balance" },
        { status: 400 }
      );
    }

    const paymentDateValue =
      paymentDate ?? new Date().toISOString().split("T")[0];

    const [created] = await db
      .insert(paymentTable)
      .values({
        debtId,
        amount: amountValue,
        paymentDate: paymentDateValue,
      })
      .returning({
        id: paymentTable.id,
        paymentDate: paymentTable.paymentDate,
      });

    const updatedTotalPaid = debt.totalPaid + amountValue;
    const updatedRemainingBalance = debt.remainingBalance - amountValue;

    return Response.json(
      {
        payment: {
          id: created.id,
          debtId,
          amount: amountValue,
          paymentDate: created.paymentDate,
        },
        totalPaid: updatedTotalPaid,
        remainingBalance: updatedRemainingBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    logError("POST /api/debts/[id]/payments failed", error, { debtId, userId });
    return Response.json(
      { error: "We couldn't add that payment. Please try again." },
      { status: 500 }
    );
  }
}
