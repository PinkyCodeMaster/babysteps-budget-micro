import { db } from "@/db";
import { debtTable } from "@/db/schema";

type SortKey = "snowball" | "low-high" | "high-low";

function sortDebts(
  debts: {
    remainingBalance: number;
    balance: number;
  }[],
  order: SortKey
) {
  if (order === "low-high") {
    return debts.sort((a, b) => a.remainingBalance - b.remainingBalance);
  }
  if (order === "high-low") {
    return debts.sort((a, b) => b.remainingBalance - a.remainingBalance);
  }
  // default snowball: smallest remaining first
  return debts.sort((a, b) => a.remainingBalance - b.remainingBalance);
}

// Lists debts with derived totals (remaining + paid) and optional sorting.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sortParam = (url.searchParams.get("sort") as SortKey | null) ?? "snowball";
  const sortKey: SortKey = ["low-high", "high-low", "snowball"].includes(sortParam)
    ? sortParam
    : "snowball";

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

  const sortedDebts = sortDebts(enrichedDebts, sortKey);

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
    debts: sortedDebts,
  });
}

// Creates a debt; numeric fields validated server-side.
export async function POST(request: Request) {
    try {
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
    } catch (error) {
        console.error("POST /api/debts failed", error);
        return Response.json({ error: "We couldn't save that debt. Please try again." }, { status: 500 });
    }
}
