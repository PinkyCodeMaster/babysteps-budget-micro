import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOnboardingProgress, setOnboardingStep } from "@/lib/onboarding";
import { AddExpenseForm } from "@/components/dashboard/add-expense-form";
import { db } from "@/db";
import { expenseTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/format";
import { Info } from "lucide-react";
import { formatExpenseAmounts, type ExpenseFrequency } from "@/lib/expenses";

export default async function OnboardingExpensesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const progress = await getOnboardingProgress(session.user.id);
  if (progress.step !== "expenses") {
    redirect(progress.nextPath);
  }

  const expenses = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, session.user.id),
  });
  const normalized = expenses.map((exp) => {
    const amount = Number(exp.amount);
    const frequency = exp.frequency as ExpenseFrequency;
    const { monthlyAmount, monthlyOutOfPocket } = formatExpenseAmounts({
      amount,
      frequency,
      paidByUc: exp.paidByUc,
    });
    return { ...exp, amount, frequency, monthlyAmount, monthlyOutOfPocket };
  });
  const monthlyTotal = normalized.reduce(
    (sum, exp) => sum + (Number.isFinite(exp.monthlyOutOfPocket) ? exp.monthlyOutOfPocket : 0),
    0
  );

  const expenseRows = normalized.map((exp) => ({
    ...exp,
    monthly: exp.monthlyAmount,
  }));

  async function backToIncomes() {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");
    await setOnboardingStep(session.user.id, "incomes");
    redirect("/onboarding/incomes");
  }

  async function continueToDebts() {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");
    const count = await db.query.expenseTable.findMany({
      where: eq(expenseTable.userId, session.user.id),
      columns: { id: true },
    });
    if (count.length === 0) return;
    await setOnboardingStep(session.user.id, "debts");
    redirect("/onboarding/debts");
  }

  async function skipExpenses() {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");
    await setOnboardingStep(session.user.id, "debts");
    redirect("/onboarding/debts");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step 2 of 3</p>
        <h1 className="text-3xl font-semibold">Add essentials</h1>
        <p className="text-muted-foreground">
          Rent, council tax, utilities, groceries - just the recurring amounts so we can guard your cashflow.
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>You can edit or delete any expense later from the dashboard if you make a mistake.</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Added so far</p>
            <p className="text-xs text-muted-foreground">
              {expenses.length} item{expenses.length === 1 ? "" : "s"} - {formatCurrency(monthlyTotal)} per month (out of pocket)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={continueToDebts}>
              <button
                type="submit"
                disabled={expenses.length === 0}
                className="text-sm font-semibold text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                Continue
              </button>
            </form>
            <form action={skipExpenses}>
              <button type="submit" className="text-xs font-semibold text-muted-foreground underline underline-offset-4">
                Skip for now
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <AddExpenseForm />
      </div>

      {expenseRows.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-foreground">What you have added</p>
          <div className="flex flex-col gap-2">
            {expenseRows.map((exp) => (
              <div
                key={exp.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{exp.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {exp.category} - {exp.type} - {exp.frequency}
                    {exp.paidByUc ? " • paid by UC" : ""}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(exp.monthly)} / mo
                  {exp.paidByUc ? " (covered)" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <form action={backToIncomes}>
          <button type="submit" className="text-sm font-semibold text-muted-foreground underline underline-offset-4">
            Back to incomes
          </button>
        </form>
        <form action={continueToDebts}>
          <button
            type="submit"
            disabled={expenses.length === 0}
            className="text-sm font-semibold text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            Continue to debts
          </button>
        </form>
      </div>
    </div>
  );
}
