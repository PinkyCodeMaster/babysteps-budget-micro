import { IconCheck, IconMail, IconPlus } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OnboardingGuideProps = {
  incomesCount: number;
  expensesCount: number;
  debtsCount: number;
  notificationsOn: boolean;
};

const steps = [
  {
    id: "income",
    label: "Add your income",
    href: "/dashboard/income",
    description: "Hourly, net monthly, gross yearly, or UC.",
  },
  {
    id: "expenses",
    label: "Add essentials",
    href: "/dashboard/expenses",
    description: "Rent, council tax, utilities, groceries.",
  },
  {
    id: "debts",
    label: "Add debts",
    href: "/dashboard/debts",
    description: "Cards, loans, arrears; we sort snowball order.",
  },
];

export function OnboardingGuide({
  incomesCount,
  expensesCount,
  debtsCount,
  notificationsOn,
}: OnboardingGuideProps) {
  const completionMap: Record<(typeof steps)[number]["id"], boolean> = {
    income: incomesCount > 0,
    expenses: expensesCount > 0,
    debts: debtsCount > 0,
  };

  const completed = steps.reduce((sum, step) => sum + (completionMap[step.id] ? 1 : 0), 0);
  const percent = Math.round((completed / steps.length) * 100);

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center justify-between gap-3 text-base sm:text-lg">
          <span>Quick start</span>
          <span className="text-sm font-medium text-muted-foreground">{percent}% done</span>
        </CardTitle>
        <CardDescription>
          Hit these three steps to get the most accurate snowball. Edit anytime.
        </CardDescription>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/70">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => {
          const done = completionMap[step.id];
          const icon =
            step.id === "notifications" ? (
              <IconMail className="h-4 w-4" />
            ) : (
              <IconPlus className="h-4 w-4" />
            );

          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 transition hover:border-primary/50 hover:shadow-sm",
                done ? "border-primary/50 bg-primary/5" : "border-border/70 bg-card"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 grid h-8 w-8 place-content-center rounded-full border",
                  done
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/80 bg-secondary/60 text-muted-foreground"
                )}
              >
                {done ? <IconCheck className="h-4 w-4" /> : icon}
              </div>
              <div className="space-y-1">
                <p className="font-medium leading-tight">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <p className="text-xs font-semibold text-primary">
                  {done ? "Completed" : "Start now"}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
      <CardContent className="mt-0 space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-dashed p-3">
          <div>
            <p className="text-sm font-semibold">Email reminders</p>
            <p className="text-xs text-muted-foreground">
              Optional nudges before due dates. You are currently {notificationsOn ? "on" : "off"}.
            </p>
          </div>
          <Link href="/dashboard/settings" className="text-sm font-semibold text-primary underline underline-offset-4">
            {notificationsOn ? "Manage" : "Turn on"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
