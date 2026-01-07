import { AppSidebar } from "@/components/app-sidebar";
import { AddIncomeForm } from "@/components/dashboard/add-income-form";
import { IncomeVisuals } from "@/components/dashboard/income-visuals";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { db } from "@/db";
import { debtTable, incomeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import {
  estimateNetMonthly,
  calculateUcPayment,
  inferBasisFromIncome,
  denormalizeIncomeAmount,
  defaultHoursGuess,
  type IncomeBasis,
  type IncomeType,
  type IncomeCategory,
  type PaymentFrequency,
} from "@/lib/income-logic";
import { getOnboardingProgress } from "@/lib/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditIncomeForm } from "@/components/dashboard/edit-income-form";
import { expenseTable } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type React from "react";
import { formatExpenseAmounts, normalizeExpenseToMonthly, type ExpenseFrequency } from "@/lib/expenses";

type IncomeWithNet = {
  id: number;
  name: string;
  type: IncomeType;
  amount: number;
  hoursPerWeek: number | null;
  category?: IncomeCategory | null;
  frequency: PaymentFrequency | null;
  netMonthly: number;
  basis: IncomeBasis;
  displayAmount: number;
};

const basisLabels: Record<IncomeBasis, string> = {
  hourly: "Hourly (gross)",
  monthly_net: "Monthly (net)",
  weekly_net: "Weekly (net)",
  fortnightly_net: "Bi-weekly (net)",
  four_weekly_net: "Four-weekly (net)",
  yearly_gross: "Yearly (gross)",
  uc: "Universal Credit (net)",
};

function basisSuffix(basis: IncomeBasis) {
  switch (basis) {
    case "hourly":
      return "/hr gross";
    case "yearly_gross":
      return "/yr gross";
    case "weekly_net":
      return "/wk net";
    case "fortnightly_net":
      return "/2wk net";
    case "four_weekly_net":
      return "/4wk net";
    case "uc":
      return "/mo (UC award)";
    default:
      return "/mo net";
  }
}

async function loadIncomeData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const progress = await getOnboardingProgress(session.user.id);
  if (progress.step !== "incomes" && progress.step !== "done") {
    redirect(progress.nextPath);
  }

  const incomes = await db.query.incomeTable.findMany({
    where: eq(incomeTable.userId, session.user.id),
  });

  const enriched: IncomeWithNet[] = incomes.map((income) => {
    const rawAmount = Number(income.amount);
    const amount = Number.isFinite(rawAmount) ? rawAmount : 0;
    const rawHours = income.hoursPerWeek === null ? null : Number(income.hoursPerWeek);
    const hoursPerWeek = rawHours !== null && Number.isFinite(rawHours) ? rawHours : null;
    const hoursForCalc = income.type === "hourly" ? (hoursPerWeek ?? defaultHoursGuess) : hoursPerWeek;
    const basis = inferBasisFromIncome({ type: income.type as IncomeType, frequency: income.frequency as PaymentFrequency });
    const displayAmount = denormalizeIncomeAmount(amount, basis);
    const category = (income.category as IncomeCategory | null) ?? null;
    return {
      ...income,
      amount,
      hoursPerWeek: hoursPerWeek ?? (income.type === "hourly" ? defaultHoursGuess : null),
      category,
      basis,
      displayAmount,
      frequency: income.frequency as PaymentFrequency,
      netMonthly: estimateNetMonthly({
        type: income.type as IncomeType,
        amount,
        hoursPerWeek: hoursForCalc,
      }),
    };
  });

  // Pick up UC from an entry typed as "uc" or named "universal credit" (fallback for users who picked the wrong type).
  const ucCandidate =
    enriched.find((inc) => inc.type === "uc") ||
    enriched.find((inc) => inc.name.toLowerCase().includes("universal")) ||
    enriched.find((inc) => inc.name.toLowerCase().includes("uc")) ||
    enriched.find((inc) => (inc.category ?? "").toLowerCase() === "uc");

  const baseFromEnv = Number(process.env.UC_BASE_MONTHLY ?? 0);
  const disregardFromEnv = Number(process.env.UC_TAPER_DISREGARD ?? 411);
  const taperRateFromEnv = Number(process.env.UC_TAPER_RATE ?? 0.55);
  const ucBaseEnv = Number.isFinite(baseFromEnv) ? baseFromEnv : 0;
  const taperIgnore = Number.isFinite(disregardFromEnv) ? disregardFromEnv : 411;
  const taperRate = Number.isFinite(taperRateFromEnv) ? taperRateFromEnv : 0.55;
  const ucBase =
    ucCandidate && Number.isFinite(ucCandidate.netMonthly) ? ucCandidate.netMonthly : ucBaseEnv;
  // Pull UC managed payments (rent/service charge etc.) that are flagged as paid by UC so the cash payment reflects deductions.
  const expenses = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, session.user.id),
  });
  const debts = await db.query.debtTable.findMany({
    with: { payments: true },
    where: eq(debtTable.userId, session.user.id),
  });
  const paidByUcMonthly = expenses
    .filter((exp) => exp.paidByUc)
    .reduce((sum, exp) => {
      const { monthlyAmount } = formatExpenseAmounts({
        amount: Number(exp.amount),
        frequency: exp.frequency as ExpenseFrequency,
        paidByUc: exp.paidByUc,
      });
      return sum + monthlyAmount;
    }, 0);
  const ucAdvanceMonthly = debts
    .filter((debt) => debt.type === "uc_advance")
    .reduce((sum, debt) => {
      const payments = debt.payments ?? [];
      const totalPaid = payments.reduce((pSum, p) => pSum + Number(p.amount ?? 0), 0);
      const balance = Number(debt.balance);
      if (!Number.isFinite(balance) || balance - totalPaid <= 0) {
        return sum;
      }
      const minimum = debt.minimumPayment === null ? 0 : Number(debt.minimumPayment);
      if (!Number.isFinite(minimum) || minimum <= 0) {
        return sum;
      }
      const frequency = (debt.frequency as ExpenseFrequency) ?? "monthly";
      return sum + normalizeExpenseToMonthly(minimum, frequency);
    }, 0);

  const ucPayment = calculateUcPayment({
    incomes: enriched,
    base: ucBase,
    taperIgnore,
    taperRate,
    paidByUcMonthly: paidByUcMonthly + ucAdvanceMonthly,
  });
  const incomesWithoutUc = enriched.filter(
    (inc) => inc !== ucCandidate && inc.type !== "uc"
  );
  const totalNetMonthly = incomesWithoutUc.reduce(
    (sum, inc) => sum + (Number.isFinite(inc.netMonthly) ? inc.netMonthly : 0),
    0
  );
  const ucPaymentSafe = Number.isFinite(ucPayment) ? ucPayment : 0;
  const incomesWithAdjustedUc = [
    ...incomesWithoutUc,
    ...(ucCandidate || ucBase
      ? [
          {
            ...(ucCandidate ?? {
              id: -1,
              name: "Universal Credit",
            type: "uc",
            amount: ucBase,
            hoursPerWeek: null,
            frequency: "monthly" as PaymentFrequency,
            basis: "uc" as IncomeBasis,
            displayAmount: ucBase,
          }),
            netMonthly: ucPaymentSafe,
          },
        ]
      : []),
  ];

  return {
    incomes: incomesWithAdjustedUc,
    summary: {
      totalNetMonthly,
      ucPayment: ucPaymentSafe,
      householdMonthly: totalNetMonthly + ucPaymentSafe,
    },
  };
}

export default async function IncomePage() {
  const data = await loadIncomeData();

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
                  Log pay, side income, and UC estimates here. Update them anytime - your totals will refresh without judgment.
                </div>
              </div>

              <div className="grid gap-3 px-4 md:grid-cols-3 lg:px-6">
                <Card className="border border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Take-home per month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(data.summary.totalNetMonthly)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Includes tax/NI for hourly and yearly amounts.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      UC estimate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(data.summary.ucPayment)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on base, taper, and disregard settings.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total monthly income
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(data.summary.householdMonthly)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Take-home plus UC for this account.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="px-4 lg:px-6 space-y-4">
                <IncomeVisuals incomes={data.incomes} />

                <AddIncomeForm />

                {data.incomes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add incomes when you are ready. We will project your monthly cash without pressure.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.incomes.map((income) => (
                      <Card key={income.id} className="border border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {income.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                                {basisLabels[income.basis]}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(income.netMonthly)}/mo net
                      </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Recorded amount</span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(income.displayAmount)}
                              {basisSuffix(income.basis)}
                            </span>
                          </div>
                          {income.basis === "hourly" && income.hoursPerWeek && (
                            <div className="flex items-center justify-between">
                              <span>
                                Hours per week
                                {income.hoursPerWeek === defaultHoursGuess ? " (estimated)" : ""}
                              </span>
                              <span className="font-medium text-foreground">
                                {income.hoursPerWeek}
                              </span>
                            </div>
                          )}
                          {income.frequency && (
                            <div className="flex items-center justify-between">
                              <span>Pay cycle</span>
                              <span className="font-medium text-foreground">
                                {income.frequency.replace("_", "-")}
                              </span>
                            </div>
                          )}
                          <div className="pt-1">
                            <EditIncomeForm income={income} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
