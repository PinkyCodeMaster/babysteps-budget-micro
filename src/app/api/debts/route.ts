import { db } from "@/db";
import { debtTable } from "@/db/schema";

// Lists debts with derived totals (remaining + paid) and snowball ordering.
export async function GET() {
  const debts = await db.query.debtTable.findMany({
    with: {
      payments: true,
    },
  });

  // Derive totals per debt from payment rows rather than storing duplicates.
  const enrichedDebts = debts.map((debt) => {
    const totalPaid = debt.payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    const remainingBalance = debt.balance - totalPaid;

    return {
      ...debt,
      remainingBalance,
      totalPaid,
    };
  });

  // Debt snowball: smallest remaining balance first.
  const snowballDebts = enrichedDebts.sort(
    (a, b) => a.remainingBalance - b.remainingBalance
  );

  const totalDebt = debts.reduce(
    (sum, d) => sum + d.balance,
    0
  );

  const totalPaid = debts.reduce(
    (sum, d) =>
      sum +
      d.payments.reduce((pSum, p) => pSum + p.amount, 0),
    0
  );

  const progressPercent =
    totalDebt === 0
      ? 0
      : Math.round((totalPaid / totalDebt) * 100);

  return Response.json({
    summary: {
      totalDebt,
      totalPaid,
      progressPercent,
    },
    debts: snowballDebts,
  });
}

// Creates a debt; numeric fields validated server-side.
export async function POST(request: Request) {
    const body = await request.json();

    const { name, type, balance, interestRate, minimumPayment, } = body;

    if (!name || balance <= 0 || minimumPayment <= 0) {

        return Response.json(
            { error: "Please check the debt details and try again." },
            { status: 400 }
        );
    }

    const [created] = await db
        .insert(debtTable)
        .values({ name, type, balance, interestRate, minimumPayment, })
        .returning({ id: debtTable.id });

    return Response.json({ id: created.id }, { status: 201 });
}
