import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOnboardingProgress, setOnboardingStep } from "@/lib/onboarding";
import { AddIncomeForm } from "@/components/dashboard/add-income-form";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/format";
import { Info } from "lucide-react";
import {
  estimateNetMonthly,
  inferBasisFromIncome,
  denormalizeIncomeAmount,
  calculateUcPayment,
  type IncomeBasis,
  type PaymentFrequency,
  type IncomeType,
  type IncomeCategory,
} from "@/lib/income-logic";

export default async function OnboardingIncomesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const progress = await getOnboardingProgress(session.user.id);
  if (progress.step !== "incomes") {
    redirect(progress.nextPath);
  }

  const incomes = await db.query.incomeTable.findMany({
    where: eq(incomeTable.userId, session.user.id),
  });

  const enriched = incomes.map((inc) => {
    const monthly = estimateNetMonthly({
      type: inc.type as IncomeType,
      amount: Number(inc.amount),
      hoursPerWeek: inc.hoursPerWeek,
    });
    const basis = inferBasisFromIncome({
      type: inc.type as IncomeType,
      frequency: inc.frequency as PaymentFrequency,
    });
    const displayAmount = denormalizeIncomeAmount(Number(inc.amount), basis);
    const category = (inc.category as IncomeCategory | null) ?? null;
    return {
      ...inc,
      monthly,
      netMonthly: monthly,
      category,
      basis: basis as IncomeBasis,
      displayAmount,
      frequency: inc.frequency as PaymentFrequency,
    };
  });

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
    ucCandidate && Number.isFinite(ucCandidate.monthly) ? ucCandidate.monthly : ucBaseEnv;

  const ucPayment = calculateUcPayment({
    incomes: enriched,
    base: ucBase,
    taperIgnore,
    taperRate,
    paidByUcMonthly: 0,
  });

  const incomesWithoutUc = enriched.filter((inc) => inc !== ucCandidate && inc.type !== "uc");
  const totalNetMonthly = incomesWithoutUc.reduce(
    (sum, inc) => sum + (Number.isFinite(inc.monthly) ? inc.monthly : 0),
    0
  );
  const ucPaymentSafe = Number.isFinite(ucPayment) ? ucPayment : 0;
  const monthlyTotal = totalNetMonthly + ucPaymentSafe;
  const incomeRows = [
    ...incomesWithoutUc,
    ...(ucCandidate || ucBase
      ? [
          {
            ...(ucCandidate ?? { id: -1, name: "Universal Credit" }),
            monthly: ucPaymentSafe,
            basis: "uc" as IncomeBasis,
            displayAmount: ucBase,
            frequency: (ucCandidate?.frequency as PaymentFrequency) ?? "monthly",
          },
        ]
      : []),
  ];

  async function continueToExpenses() {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");
    const count = await db.query.incomeTable.findMany({
      where: eq(incomeTable.userId, session.user.id),
      columns: { id: true },
    });
    if (count.length === 0) return;
    await setOnboardingStep(session.user.id, "expenses");
    redirect("/onboarding/expenses");
  }

  async function skipIncomes() {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");
    await setOnboardingStep(session.user.id, "expenses");
    redirect("/onboarding/expenses");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1 of 3</p>
        <h1 className="text-3xl font-semibold">Add your income</h1>
        <p className="text-muted-foreground">
          Log your wages, UC, side gigs, or benefits. We only need enough to show safe-to-use cash.
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>Made a mistake? You can edit or delete income later from the dashboard.</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Added so far</p>
            <p className="text-xs text-muted-foreground">
              {incomes.length} source{incomes.length === 1 ? "" : "s"} - {formatCurrency(monthlyTotal)} per month
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={continueToExpenses}>
              <button
                type="submit"
                disabled={incomes.length === 0}
                className="text-sm font-semibold text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                Continue
              </button>
            </form>
            <form action={skipIncomes}>
              <button type="submit" className="text-xs font-semibold text-muted-foreground underline underline-offset-4">
                Skip for now
              </button>
            </form>
          </div>
        </div>
      </div>

      {incomeRows.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-foreground">What you have added</p>
          <div className="flex flex-col gap-2">
            {incomeRows.map((inc) => (
              <div
                key={inc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{inc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {inc.basis.replace("_", " ")} - {(inc.frequency ?? "monthly").replace("_", " ")}
                  </span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(inc.displayAmount)}</span>
                  <span className="text-xs text-muted-foreground">Monthly equivalent {formatCurrency(inc.monthly)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <AddIncomeForm />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>You can add more than one source now or later from the dashboard.</span>
        <form action={continueToExpenses}>
          <button
            type="submit"
            disabled={incomes.length === 0}
            className="text-sm font-semibold text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            Continue to expenses
          </button>
        </form>
      </div>
    </div>
  );
}
