import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOnboardingProgress, setOnboardingStep } from "@/lib/onboarding";
import { AddDebtForm } from "@/components/dashboard/add-debt-form";
import { DebtCsvImport } from "@/components/dashboard/debt-csv-import";
import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/format";
import { Info } from "lucide-react";

export default async function OnboardingDebtsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const progress = await getOnboardingProgress(session.user.id);
  if (progress.step !== "debts") {
    redirect(progress.nextPath);
  }

  const debts = await db.query.debtTable.findMany({
    where: eq(debtTable.userId, session.user.id),
  });
  const total = debts.reduce((sum, debt) => sum + Number(debt.balance), 0);

  async function backToExpenses() {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");
    await setOnboardingStep(session.user.id, "expenses");
    redirect("/onboarding/expenses");
  }

  async function finishOnboarding() {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");
    const count = await db.query.debtTable.findMany({
      where: eq(debtTable.userId, session.user.id),
      columns: { id: true },
    });
    if (count.length === 0) return;
    await setOnboardingStep(session.user.id, "done");
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step 3 of 3</p>
        <h1 className="text-3xl font-semibold">Add your debts</h1>
        <p className="text-muted-foreground">
          Cards, loans, arrears - add balances and minimums. We will sort snowball order automatically.
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>You can edit, delete, or add debts later from the dashboard if you make a mistake.</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Added so far</p>
            <p className="text-xs text-muted-foreground">
              {debts.length} debt{debts.length === 1 ? "" : "s"} - {formatCurrency(total)} total
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={finishOnboarding}>
              <button
                type="submit"
                disabled={debts.length === 0}
                className="text-sm font-semibold text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                Finish
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                const session = await auth.api.getSession({ headers: await headers() });
                if (!session) redirect("/sign-in");
                await setOnboardingStep(session.user.id, "done");
                redirect("/dashboard");
              }}
            >
              <button type="submit" className="text-xs font-semibold text-muted-foreground underline underline-offset-4">
                Skip for now
              </button>
            </form>
          </div>
        </div>
      </div>

      {debts.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-foreground">What you have added</p>
          <div className="flex flex-col gap-2">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{debt.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {debt.type} {debt.frequency ? `- ${debt.frequency}` : ""}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(Number(debt.balance))} total</span>
                  {debt.minimumPayment !== null && debt.minimumPayment !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      Min payment: {formatCurrency(Number(debt.minimumPayment))}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <AddDebtForm />
      </div>

      <DebtCsvImport />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <form action={backToExpenses}>
          <button type="submit" className="text-sm font-semibold text-muted-foreground underline underline-offset-4">
            Back to essentials
          </button>
        </form>
        <form action={finishOnboarding}>
          <button
            type="submit"
            disabled={debts.length === 0}
            className="text-sm font-semibold text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            Finish and go to dashboard
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            const session = await auth.api.getSession({ headers: await headers() });
            if (!session) redirect("/sign-in");
            await setOnboardingStep(session.user.id, "done");
            redirect("/dashboard");
          }}
        >
          <button type="submit" className="text-xs font-semibold text-muted-foreground underline underline-offset-4">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
