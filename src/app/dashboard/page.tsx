import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AddDebtPanel } from "@/components/dashboard/add-debt-panel";
import { AddPaymentForm } from "@/components/dashboard/add-payment-form";
import { DeleteDebtButton } from "@/components/dashboard/delete-debt-button";
import { EditDebtForm } from "@/components/dashboard/edit-debt-form";
import { DashboardVisuals } from "@/components/dashboard/dashboard-visuals";
import { auth } from "@/lib/auth";
import { estimateNetMonthly, calculateUcPayment, type IncomeType } from "@/lib/income-logic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { debtTable, incomeTable, expenseTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/format";
import { sortDebts, calculateProgress, SortKey } from "@/lib/debt-logic";
import type React from "react";

type Debt = {
  id: number;
  name: string;
  type: string;
  balance: number;
  interestRate: number | null;
  minimumPayment: number;
  remainingBalance: number;
  payments: { amount: number; paymentDate: string }[];
};

type DebtWithTotals = Debt & { totalPaid: number };

type Income = {
  id: number;
  name: string;
  type: IncomeType;
  amount: number;
  hoursPerWeek: number | null;
  netMonthly: number;
};

type Expense = {
  id: number;
  name: string;
  type: string;
  amount: number;
};

type DashboardData = {
  summary: {
    totalDebt: number;
    totalPaid: number;
    paidThisMonth: number;
    progressPercent: number;
    monthlyIncome: number;
    ucPayment: number;
    householdIncome: number;
    monthlyExpenses: number;
    netCashflow: number;
  };
  debts: DebtWithTotals[];
  incomes: Income[];
  expenses: Expense[];
};

async function loadDashboardData(sort: SortKey): Promise<DashboardData> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const debts = await db.query.debtTable.findMany({
    with: { payments: true },
    where: eq(debtTable.userId, session!.user.id),
  });

  const incomesRaw = await db.query.incomeTable.findMany({
    where: eq(incomeTable.userId, session!.user.id),
  });

  const incomes: Income[] = incomesRaw.map((income) => ({
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
  const expenses = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, session!.user.id),
  });
  const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netCashflow = householdIncome - monthlyExpenses;

  const enriched: DebtWithTotals[] = debts.map((debt) => {
    const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = debt.balance - totalPaid;
    return { ...debt, totalPaid, remainingBalance };
  });

  const sortedDebts = sortDebts(enriched, sort);
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalPaid = debts.reduce(
    (sum, d) => sum + d.payments.reduce((pSum, p) => pSum + p.amount, 0),
    0
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const paidThisMonth = debts.reduce((sum, d) => {
    return (
      sum +
      d.payments.reduce((pSum, p) => {
        const dt = new Date(p.paymentDate as unknown as string);
        return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear
          ? pSum + p.amount
          : pSum;
      }, 0)
    );
  }, 0);

  const progressPercent = calculateProgress(totalDebt, totalPaid);

  return {
    summary: {
      totalDebt,
      totalPaid,
      paidThisMonth,
      progressPercent,
      monthlyIncome,
      ucPayment,
      householdIncome,
      monthlyExpenses,
      netCashflow,
    },
    debts: sortedDebts,
    incomes,
    expenses,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sortKey: SortKey =
    sortParam === "low-high" || sortParam === "high-low" || sortParam === "snowball"
      ? sortParam
      : "snowball";

  const data = await loadDashboardData(sortKey);
  const nextDebt = data.debts[0];

  const totalMinimums = data.debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const snowballAvailable = Math.max(0, data.summary.netCashflow - totalMinimums);

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
              <div className="px-4 lg:px-6">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-muted-foreground shadow-sm shadow-primary/5 backdrop-blur">
                  <p className="text-foreground font-medium">You are in the right place.</p>
                  <p>
                    Keep logging payments when you can. Miss a week? No worries - your totals stay ready for whenever you pick it back up.
                  </p>
                </div>
              </div>
              <SectionCards
                remainingTotal={formatCurrency(data.summary.totalDebt - data.summary.totalPaid)}
                totalPaid={formatCurrency(data.summary.totalPaid)}
                paidThisMonth={formatCurrency(data.summary.paidThisMonth)}
                progressLabel={`${data.summary.progressPercent}%`}
                snowballAvailable={formatCurrency(snowballAvailable)}
              />
              <DashboardVisuals
                debts={data.debts}
                expenses={data.expenses.map((exp) => ({ name: exp.type, amount: exp.amount }))}
                summary={{
                  householdIncome: data.summary.householdIncome,
                  monthlyExpenses: data.summary.monthlyExpenses,
                  netCashflow: data.summary.netCashflow,
                  snowballAvailable,
                  totalMinimums,
                  totalDebt: data.summary.totalDebt,
                  totalPaid: data.summary.totalPaid,
                }}
              />
              <div className="px-4 lg:px-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">Your debts</h2>
                  <div className="text-sm text-muted-foreground">
                    We keep snowball order sorted. Adjust anytime.
                  </div>
                </div>
                <AddDebtPanel />
                {data.debts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add your first debt whenever you are ready - we will sort the order and keep totals for you.
                  </p>
                )}
                {data.debts.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur"
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
                      <div className="space-y-1.5">
                        <AddPaymentForm
                          debtId={debt.id}
                          remainingBalance={debt.remainingBalance}
                        />
                        <p className="text-xs text-muted-foreground">
                          Skip a week? That is ok. Log the next payment when you are ready and we will update totals.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
