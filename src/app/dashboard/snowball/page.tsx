import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddPaymentForm } from "@/components/dashboard/add-payment-form";
import { DebtsVisuals } from "@/components/dashboard/debts-visuals";
import { DeleteDebtButton } from "@/components/dashboard/delete-debt-button";
import { EditDebtForm } from "@/components/dashboard/edit-debt-form";
import { auth } from "@/lib/auth";
import { calculateUcPayment, estimateNetMonthly, type IncomeType } from "@/lib/income-logic";
import { calculateProgress, sortDebts, type SortKey } from "@/lib/debt-logic";
import { formatCurrency } from "@/lib/format";
import { db } from "@/db";
import { debtTable, expenseTable, incomeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";

type Debt = {
  id: number;
  name: string;
  type: string;
  balance: number;
  interestRate: number | null;
  minimumPayment: number;
  payments: { amount: number; paymentDate: string }[];
};

type DebtWithTotals = Debt & { totalPaid: number; remainingBalance: number };

async function loadSnowball(sort: SortKey) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const debts = await db.query.debtTable.findMany({
    with: { payments: true },
    where: eq(debtTable.userId, session.user.id),
  });

  const expenses = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, session.user.id),
  });
  const incomesRaw = await db.query.incomeTable.findMany({
    where: eq(incomeTable.userId, session.user.id),
  });

  const incomes = incomesRaw.map((income) => ({
    ...income,
    netMonthly: estimateNetMonthly({
      type: income.type as IncomeType,
      amount: income.amount,
      hoursPerWeek: income.hoursPerWeek,
    }),
  }));

  const ucCandidate =
    incomes.find((inc) => inc.type === "uc") ||
    incomes.find((inc) => inc.name.toLowerCase().includes("universal"));

  const ucBase = ucCandidate ? ucCandidate.netMonthly : Number(process.env.UC_BASE_MONTHLY ?? 0);
  const taperIgnore = Number(process.env.UC_TAPER_DISREGARD ?? 411);
  const taperRate = Number(process.env.UC_TAPER_RATE ?? 0.55);
  const ucPayment = calculateUcPayment({
    incomes,
    base: ucBase,
    taperIgnore,
    taperRate,
  });
  const incomesWithoutUc = incomes.filter(
    (inc) => inc !== ucCandidate && inc.type !== "uc"
  );
  const monthlyIncome = incomesWithoutUc.reduce((sum, inc) => sum + inc.netMonthly, 0);
  const householdIncome = monthlyIncome + ucPayment;
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const enriched: DebtWithTotals[] = debts.map((debt) => {
    const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = debt.balance - totalPaid;
    return { ...debt, totalPaid, remainingBalance };
  });

  const sorted = sortDebts(enriched, sort);
  const totalMinimums = enriched.reduce((sum, d) => sum + d.minimumPayment, 0);
  const netCashflow = householdIncome - monthlyExpenses;
  const snowballAvailable = Math.max(0, netCashflow - totalMinimums);
  const next = sorted[0];
  const monthsToClearNext =
    next && next.remainingBalance > 0
      ? Math.ceil(next.remainingBalance / Math.max(1, next.minimumPayment + snowballAvailable))
      : 0;

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalPaid = debts.reduce(
    (sum, d) => sum + d.payments.reduce((pSum, p) => pSum + p.amount, 0),
    0
  );

  return {
    debts: sorted,
    summary: {
      monthlyIncome,
      ucPayment,
      householdIncome,
      monthlyExpenses,
      netCashflow,
      totalMinimums,
      snowballAvailable,
      nextDebt: next,
      monthsToClearNext,
      totalDebt,
      totalPaid,
      progressPercent: calculateProgress(totalDebt, totalPaid),
    },
  };
}

export default async function SnowballPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sortKey: SortKey =
    sortParam === "low-high" || sortParam === "high-low" || sortParam === "snowball"
      ? sortParam
      : "snowball";

  const data = await loadSnowball(sortKey);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="grid gap-3 px-4 md:grid-cols-3 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Net cashflow after expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(data.summary.netCashflow)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Income plus UC minus monthly expenses. If it dips one month, that is okay - we will adjust.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Minimum payments total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(data.summary.totalMinimums)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sum of minimums across active debts. We keep these handy for you.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Snowball available
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(data.summary.snowballAvailable)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Net cashflow minus minimums. Apply what you can; pausing is fine.
                    </p>
                  </CardContent>
                </Card>
                {data.summary.nextDebt && (
                  <Card className="md:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Next payoff target (snowball order)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-3">
                      <div className="space-y-1">
                        <p className="text-base font-semibold">
                          {data.summary.nextDebt.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Remaining {formatCurrency(data.summary.nextDebt.remainingBalance)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        Extra snowball {formatCurrency(data.summary.snowballAvailable)}
                      </Badge>
                      <Badge variant="secondary">
                        Est. {data.summary.monthsToClearNext} months to clear
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DebtsVisuals
                debts={data.debts}
                summary={{
                  snowballAvailable: data.summary.snowballAvailable,
                  totalPaid: data.summary.totalPaid,
                  totalDebt: data.summary.totalDebt,
                }}
              />

              <div className="px-4 lg:px-6 space-y-4">
                {data.debts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add your first debt when you are ready - we will build the snowball plan for you.
                  </p>
                )}
                {data.debts.map((debt, idx) => (
                  <Card key={debt.id} className="border border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{idx + 1}</Badge>
                            <CardTitle className="text-base font-semibold">
                              {debt.name}
                            </CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Remaining {formatCurrency(debt.remainingBalance)} - Minimum{" "}
                            {formatCurrency(debt.minimumPayment)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <EditDebtForm debt={debt} />
                          <DeleteDebtButton debtId={debt.id} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {idx === 0 && data.summary.snowballAvailable > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Apply your snowball extra of {formatCurrency(data.summary.snowballAvailable)} here first. If you
                          need to pause, just pick back up later.
                        </p>
                      )}
                      {debt.remainingBalance > 0 && (
                        <AddPaymentForm
                          debtId={debt.id}
                          remainingBalance={debt.remainingBalance}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
