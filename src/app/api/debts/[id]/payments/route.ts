import { db } from "@/db";
import { debtTable, paymentTable } from "@/db/schema";
import { eq } from "drizzle-orm";

type ParsedId = { debtId: number } | { error: Response };

function parseDebtId(id: string): ParsedId {
  const debtId = Number(id);
  if (Number.isNaN(debtId)) {
    return { error: Response.json({ error: "Invalid debt id" }, { status: 400 }) };
  }

  return { debtId };
}

async function fetchDebt(debtId: number) {
  const debt = await db.query.debtTable.findFirst({
    where: eq(debtTable.id, debtId),
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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const parsed = parseDebtId(params.id);
  if ("error" in parsed) return parsed.error;
  const debtId = parsed.debtId;

  const debt = await fetchDebt(debtId);
  if (debt.error) return debt.error;

  return Response.json({
    payments: debt.data.payments,
    totalPaid: debt.totalPaid,
    remainingBalance: debt.remainingBalance,
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const parsed = parseDebtId(params.id);
  if ("error" in parsed) return parsed.error;
  const debtId = parsed.debtId;

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

  const debt = await fetchDebt(debtId);
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
}
