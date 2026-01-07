import { db } from "@/db";
import { debtTable, expenseTable, incomeTable, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export type OnboardingStep = "incomes" | "expenses" | "debts" | "done";

type Params = {
  incomesCount: number;
  expensesCount: number;
  debtsCount: number;
};

export function computeOnboardingStep({ incomesCount, expensesCount, debtsCount }: Params): OnboardingStep {
  if (incomesCount <= 0) return "incomes";
  if (expensesCount <= 0) return "expenses";
  if (debtsCount <= 0) return "debts";
  return "done";
}

export function onboardingNextPath(step: OnboardingStep) {
  switch (step) {
    case "incomes":
      return "/onboarding/incomes";
    case "expenses":
      return "/onboarding/expenses";
    case "debts":
      return "/onboarding/debts";
    default:
      return "/dashboard";
  }
}

export async function getOnboardingProgress(userId: string) {
  const [incomes, expenses, debts, prefs] = await Promise.all([
    db.query.incomeTable.findMany({ where: eq(incomeTable.userId, userId) }),
    db.query.expenseTable.findMany({ where: eq(expenseTable.userId, userId) }),
    db.query.debtTable.findMany({ where: eq(debtTable.userId, userId) }),
    db.query.user.findFirst({ where: eq(user.id, userId), columns: { notifyEmails: true, onboardingStep: true } }),
  ]);

  const incomesCount = incomes.length;
  const expensesCount = expenses.length;
  const debtsCount = debts.length;
  const computedStep = computeOnboardingStep({ incomesCount, expensesCount, debtsCount });
  const storedStep = prefs?.onboardingStep;
  const step: OnboardingStep =
    storedStep === "incomes" || storedStep === "expenses" || storedStep === "debts" || storedStep === "done"
      ? storedStep
      : computedStep;

  if (prefs?.onboardingStep !== step) {
    await db
      .update(user)
      .set({ onboardingStep: step, updatedAt: new Date() })
      .where(eq(user.id, userId));
  }

  return { step, nextPath: onboardingNextPath(step), notifyEmails: prefs?.notifyEmails ?? true };
}

export async function setOnboardingStep(userId: string, step: OnboardingStep) {
  await db.update(user).set({ onboardingStep: step, updatedAt: new Date() }).where(eq(user.id, userId));
}
