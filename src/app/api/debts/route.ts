import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { SortKey, sortDebts, calculateProgress } from "@/lib/debt-logic";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// Lists debts with derived totals (remaining + paid) and optional sorting.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const sortParam = (url.searchParams.get("sort") as SortKey | null) ?? "snowball";
  const sortKey: SortKey = ["low-high", "high-low", "snowball"].includes(sortParam)
    ? sortParam
    : "snowball";

  const debts = await db.query.debtTable.findMany({
    with: {
      payments: true,
    },
    where: eq(debtTable.userId, session.user.id),
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
    calculateProgress(totalDebt, totalPaid);

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
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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
            .values({ name, type, balance, interestRate, minimumPayment, userId: session.user.id })
            .returning({ id: debtTable.id });

        return Response.json({ id: created.id }, { status: 201 });
    } catch (error) {
        console.error("POST /api/debts failed", error);
        return Response.json({ error: "We couldn't save that debt. Please try again." }, { status: 500 });
    }
}
