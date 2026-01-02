import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPaymentForm } from "@/components/add-payment-form";
import { AddDebtForm } from "@/components/add-debt-form";
import { DeleteDebtButton } from "@/components/delete-debt-button";
import { EditDebtForm } from "@/components/edit-debt-form";

type Debt = {
  id: number;
  name: string;
  type: string;
  balance: number;
  interestRate: number | null;
  minimumPayment: number;
  remainingBalance: number;
};


type DashboardData = {
  summary: {
    totalDebt: number;
    totalPaid: number;
    progressPercent: number;
  };
  debts: Debt[];
};

export default async function DashboardPage() {
  let data: DashboardData | null = null;

  try {
    const res = await fetch("/api/debts", { cache: "no-store" });

    if (res.ok) {
      data = await res.json();
    }
  } catch {
    // fall through to loading view
  }

  if (!data) {
    return (
      <main className="p-6">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  const { summary, debts } = data;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <AddDebtForm />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Total Debt</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            £{summary.totalDebt}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            £{summary.totalPaid}
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
                    Remaining: £{debt.remainingBalance}
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
