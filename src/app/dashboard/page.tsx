import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AddDebtPanel } from "@/components/dashboard/add-debt-panel";
import { AddPaymentForm } from "@/components/dashboard/add-payment-form";
import { DeleteDebtButton } from "@/components/dashboard/delete-debt-button";
import { EditDebtForm } from "@/components/dashboard/edit-debt-form";
import { DashboardVisuals } from "@/components/dashboard/dashboard-visuals";
import { auth } from "@/lib/auth";
import {
  estimateNetMonthly,
  calculateUcPayment,
  defaultHoursGuess,
  type IncomeType,
  type IncomeCategory,
} from "@/lib/income-logic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { debtTable, incomeTable, expenseTable, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/format";
import { sortDebts, calculateProgress, SortKey } from "@/lib/debt-logic";
import type React from "react";
import { revalidatePath } from "next/cache";
import type { OnboardingStep } from "@/lib/onboarding";
import { computeOnboardingStep } from "@/lib/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatExpenseAmounts, type ExpenseFrequency } from "@/lib/expenses";
import { Badge } from "@/components/ui/badge";

type Debt = {
  id: number;
  name: string;
  type: string;
  balance: number;
  interestRate: number | null;
  minimumPayment: number | null;
  remainingBalance: number;
  dueDay: number | null;
  payments: { amount: number; paymentDate: string }[];
};

type DebtWithTotals = Debt & { totalPaid: number };

type Income = {
  id: number;
  name: string;
  type: IncomeType;
  amount: number;
  hoursPerWeek: number | null;
  category?: IncomeCategory | null;
  netMonthly: number;
};

type Expense = {
  id: number;
  name: string;
  type: string;
  amount: number;
  frequency: ExpenseFrequency;
  monthlyAmount: number;
  monthlyOutOfPocket: number;
  paidByUc?: boolean;
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
    notifyEmails: boolean;
  };
  debts: DebtWithTotals[];
  incomes: Income[];
  expenses: Expense[];
  onboardingStep: OnboardingStep;
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

  const incomes: Income[] = incomesRaw.map((income) => {
    const rawAmount = Number(income.amount);
    const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
    const rawHours = income.hoursPerWeek === null ? null : Number(income.hoursPerWeek);
    const hours = rawHours !== null && Number.isFinite(rawHours) ? rawHours : null;
    const hoursForCalc = income.type === "hourly" ? (hours ?? defaultHoursGuess) : hours;
    const category = (income.category as IncomeCategory | null) ?? null;
    return {
      ...income,
      amount,
      hoursPerWeek: hours,
      category,
      netMonthly: estimateNetMonthly({
        type: income.type as IncomeType,
        amount,
        hoursPerWeek: hoursForCalc,
      }),
    };
  });

  const ucCandidate =
    incomes.find((inc) => inc.type === "uc") ||
    incomes.find((inc) => inc.name.toLowerCase().includes("universal")) ||
    incomes.find((inc) => inc.name.toLowerCase().includes("uc")) ||
    incomes.find((inc) => (inc.category ?? "").toLowerCase() === "uc");

  const baseFromEnv = Number(process.env.UC_BASE_MONTHLY ?? 0);
  const disregardFromEnv = Number(process.env.UC_TAPER_DISREGARD ?? 411);
  const taperRateFromEnv = Number(process.env.UC_TAPER_RATE ?? 0.55);
  const ucBaseEnv = Number.isFinite(baseFromEnv) ? baseFromEnv : 0;
  const taperIgnoreEnv = Number.isFinite(disregardFromEnv) ? disregardFromEnv : 411;
  const taperRateEnv = Number.isFinite(taperRateFromEnv) ? taperRateFromEnv : 0.55;
  const ucBase =
    ucCandidate && Number.isFinite(ucCandidate.netMonthly) ? ucCandidate.netMonthly : ucBaseEnv;
  const taperIgnore = taperIgnoreEnv;
  const taperRate = taperRateEnv;

  // Sum UC-paid expenses before calling UC calculation.
  const expensesRaw = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, session!.user.id),
  });
  const expenses = expensesRaw
    .map((exp) => {
      const rawAmount = Number(exp.amount);
      const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
      const frequency = exp.frequency as ExpenseFrequency;
      const { monthlyAmount, monthlyOutOfPocket } = formatExpenseAmounts({
        amount,
        frequency,
        paidByUc: exp.paidByUc,
      });
      return {
        ...exp,
        amount,
        frequency,
        monthlyAmount,
        monthlyOutOfPocket,
        paidByUc: exp.paidByUc,
      };
    })
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  const monthlyExpenses = expenses.reduce(
    (sum, exp) => sum + (Number.isFinite(exp.monthlyOutOfPocket) ? exp.monthlyOutOfPocket : 0),
    0
  );
  const paidByUcMonthly = expenses
    .filter((exp) => exp.paidByUc)
    .reduce((sum, exp) => sum + (Number.isFinite(exp.monthlyAmount) ? exp.monthlyAmount : 0), 0);

  const ucPayment = calculateUcPayment({
    incomes,
    base: ucBase,
    taperIgnore,
    taperRate,
    paidByUcMonthly,
  });
  const incomesWithoutUc = incomes.filter(
    (inc) => inc !== ucCandidate && inc.type !== "uc"
  );
  const monthlyIncome = incomesWithoutUc.reduce(
    (sum, inc) => sum + (Number.isFinite(inc.netMonthly) ? inc.netMonthly : 0),
    0
  );
  const ucPaymentSafe = Number.isFinite(ucPayment) ? ucPayment : 0;
  const householdIncome = monthlyIncome + ucPaymentSafe;
  const netCashflow = householdIncome - monthlyExpenses;
  const userPrefs = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { notifyEmails: true, onboardingStep: true },
  });

  const enriched: DebtWithTotals[] = debts.map((debt) => {
    const payments = debt.payments.map((p) => {
      const rawAmount = Number(p.amount);
      const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
      return { ...p, amount };
    });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const rawBalance = Number(debt.balance);
    const balance = Number.isFinite(rawBalance) ? rawBalance : 0;
    const rawRate = debt.interestRate === null ? null : Number(debt.interestRate);
    const interestRate = rawRate !== null && Number.isFinite(rawRate) ? rawRate : null;
    const rawMinimum = debt.minimumPayment === null ? null : Number(debt.minimumPayment);
    const minimumPayment = rawMinimum !== null && Number.isFinite(rawMinimum) ? rawMinimum : null;
    const rawDueDay = debt.dueDay === null || debt.dueDay === undefined ? null : Number(debt.dueDay);
    const dueDay = rawDueDay !== null && Number.isInteger(rawDueDay) ? rawDueDay : null;
    const remainingBalance = balance - totalPaid;
    return {
      ...debt,
      balance,
      interestRate,
      minimumPayment,
      dueDay,
      totalPaid,
      remainingBalance,
      payments,
    };
  });

  const sortedDebts = sortDebts(enriched, sort);
  const totalDebt = enriched.reduce(
    (sum, d) => sum + (Number.isFinite(d.balance) ? d.balance : 0),
    0
  );
  const totalPaid = enriched.reduce(
    (sum, d) => sum + (Number.isFinite(d.totalPaid) ? d.totalPaid : 0),
    0
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const paidThisMonth = enriched.reduce((sum, d) => {
    return (
      sum +
      d.payments.reduce((pSum, p) => {
        const dt = new Date(p.paymentDate as unknown as string);
        const amount = Number.isFinite(p.amount) ? p.amount : 0;
        return dt.getMonth() === currentMonth && dt.getFullYear() === currentYear
          ? pSum + amount
          : pSum;
      }, 0)
    );
  }, 0);

  const progressPercent = calculateProgress(totalDebt, totalPaid);

  const onboardingStep =
    userPrefs?.onboardingStep ??
    computeOnboardingStep({
      incomesCount: incomes.length,
      expensesCount: expenses.length,
      debtsCount: debts.length,
    });

  return {
    summary: {
      totalDebt,
      totalPaid,
      paidThisMonth,
      progressPercent,
      monthlyIncome,
      ucPayment: ucPaymentSafe,
      householdIncome,
      monthlyExpenses,
      netCashflow,
      notifyEmails: userPrefs?.notifyEmails ?? true,
    },
    debts: sortedDebts,
    incomes,
    expenses,
    onboardingStep: onboardingStep as OnboardingStep,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  async function updateNotifications(formData: FormData) {
    "use server";
    const enabled = formData.get("enabled") === "true";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect("/sign-in");
    }
    await db
      .update(user)
      .set({ notifyEmails: enabled, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));
    revalidatePath("/dashboard");
  }

  const { sort: sortParam } = await searchParams;
  const sortKey: SortKey =
    sortParam === "low-high" || sortParam === "high-low" || sortParam === "snowball"
      ? sortParam
      : "snowball";

  const data = await loadDashboardData(sortKey);

  if (data.onboardingStep !== "done") {
    redirect(
      data.onboardingStep === "incomes"
        ? "/onboarding/incomes"
        : data.onboardingStep === "expenses"
          ? "/onboarding/expenses"
          : "/onboarding/debts"
    );
  }

  const totalMinimums = data.debts.reduce((sum, d) => {
    const min = d.minimumPayment ?? 0;
    return sum + (Number.isFinite(min) ? min : 0);
  }, 0);
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
              <div className="px-4 lg:px-6">
                <Card className="border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">Quick actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Add income", href: "/dashboard/income" },
                      { label: "Add expense", href: "/dashboard/expenses" },
                      { label: "Add debt", href: "/dashboard/debts" },
                      { label: "Log payment", href: "/dashboard/debts#payments" },
                    ].map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center justify-center rounded-xl border border-border/70 bg-card/70 px-3 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Email notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Due-date reminders and morale check-ins. You are currently {data.summary.notifyEmails ? "on" : "off"}.
                      </p>
                    </div>
                    <form action={updateNotifications}>
                      <input type="hidden" name="enabled" value={(!data.summary.notifyEmails).toString()} />
                      <button
                        type="submit"
                        className="text-sm font-semibold text-primary underline underline-offset-4"
                      >
                        Turn {data.summary.notifyEmails ? "off" : "on"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              <SectionCards
                monthlyIncome={formatCurrency(data.summary.householdIncome)}
                remainingTotal={formatCurrency(data.summary.totalDebt - data.summary.totalPaid)}
                monthlyExpenses={formatCurrency(data.summary.monthlyExpenses)}
                paidThisMonth={formatCurrency(data.summary.paidThisMonth)}
                totalPaid={formatCurrency(data.summary.totalPaid)}
                snowballAvailable={formatCurrency(snowballAvailable)}
                progressLabel={`${data.summary.progressPercent}%`}
              />
              <DashboardVisuals
                debts={data.debts}
                expenses={data.expenses.map((exp) => ({
                  name: exp.name || exp.type,
                  amount: exp.monthlyOutOfPocket,
                  type: exp.type,
                }))}
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
                    CCJs stay at the top; the rest follow snowball order (smallest to largest).
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{debt.name}</p>
                          {debt.type === "ccj" && <Badge variant="destructive">Priority CCJ</Badge>}
                        </div>
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
