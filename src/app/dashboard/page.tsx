import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPaymentForm } from "@/components/add-payment-form";
import { AddDebtPanel } from "@/components/add-debt-panel";
import { DeleteDebtButton } from "@/components/delete-debt-button";
import { EditDebtForm } from "@/components/edit-debt-form";
import { db } from "@/db";
import { SortDebts } from "@/components/sort-debts";
import { Suspense } from "react";
import { formatCurrency } from "@/lib/format";

type Debt = {
  id: number;
  name: string;
  type: string;
  balance: number;
  interestRate: number | null;
  minimumPayment: number;
  remainingBalance: number;
};

type DebtWithTotals = Debt & {
  totalPaid: number;
};


type DashboardData = {
  summary: {
    totalDebt: number;
    totalPaid: number;
    progressPercent: number;
  };
  debts: DebtWithTotals[];
};

// Server-side loader reuses the same derived totals as the API to avoid round-trips.
async function loadDashboardData(sort: "snowball" | "low-high" | "high-low"): Promise<DashboardData> {
  const debts = await db.query.debtTable.findMany({
    with: { payments: true },
  });

  const enriched = debts.map((debt) => {
    const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = debt.balance - totalPaid;

    return {
      ...debt,
      totalPaid,
      remainingBalance,
    };
  });

  const sortedDebts = (() => {
    if (sort === "low-high") return enriched.sort((a, b) => a.remainingBalance - b.remainingBalance);
    if (sort === "high-low") return enriched.sort((a, b) => b.remainingBalance - a.remainingBalance);
    return enriched.sort((a, b) => a.remainingBalance - b.remainingBalance);
  })();

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalPaid = debts.reduce(
    (sum, d) => sum + d.payments.reduce((pSum, p) => pSum + p.amount, 0),
    0
  );

  const progressPercent =
    totalDebt === 0 ? 0 : Math.round((totalPaid / totalDebt) * 100);

  return {
    summary: {
      totalDebt,
      totalPaid,
      progressPercent,
    },
    debts: sortedDebts,
  };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  let data: DashboardData | null = null;
  let loadError: string | null = null;
  const { sort: sortKeyParam } = await searchParams;
  const sortKey =
    sortKeyParam === "low-high" || sortKeyParam === "high-low" || sortKeyParam === "snowball"
      ? sortKeyParam
      : "snowball";

  try {
    data = await loadDashboardData(sortKey);
  } catch {
    loadError = "We couldn't load your debts right now. Please refresh.";
  }

  if (loadError || !data) {
    return (
      <main className="p-6">
        <div className="space-y-3">
          <p className="text-muted-foreground">
            {loadError ?? "Loading dashboard..."}
          </p>
          {loadError && (
            <form>
              <button
                formAction="/dashboard"
                className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Retry
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  const { summary, debts } = data;

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your debts, payments, and progress. Sort by what matters to you.
          </p>
        </div>
        <Suspense fallback={<span className="text-sm text-muted-foreground">Loading sort...</span>}>
          <SortDebts />
        </Suspense>
      </div>

      <AddDebtPanel />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Total Debt</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {formatCurrency(summary.totalDebt)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {formatCurrency(summary.totalPaid)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.totalPaid === 0 ? (
              <p className="text-sm text-muted-foreground">
                No payments yet - you&apos;re about to start.
              </p>
            ) : (
              <p className="text-lg font-semibold">
                {summary.progressPercent}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Debts</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {debts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No debts yet. Add one to get started.
            </p>
          )}

          {debts.map((debt: Debt) => (
            <div
              key={debt.id}
              className="flex flex-col gap-3 border-b pb-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">{debt.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Remaining: {formatCurrency(debt.remainingBalance)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <EditDebtForm debt={debt} />
                  <DeleteDebtButton debtId={debt.id} />
                </div>
              </div>

              {debt.remainingBalance > 0 && (
                <AddPaymentForm
                  debtId={debt.id}
                  remainingBalance={debt.remainingBalance}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
