import { AppSidebar } from "@/components/app-sidebar";
import { AddExpenseForm } from "@/components/dashboard/add-expense-form";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { expenseTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import type React from "react";

type ExpenseType =
  | "housing"
  | "utilities"
  | "transport"
  | "food"
  | "childcare"
  | "insurance"
  | "subscriptions"
  | "medical"
  | "education"
  | "entertainment"
  | "savings"
  | "other";

const labels: Record<ExpenseType, string> = {
  housing: "Housing",
  utilities: "Utilities",
  transport: "Transport",
  food: "Food",
  childcare: "Childcare",
  insurance: "Insurance",
  subscriptions: "Subscriptions",
  medical: "Medical",
  education: "Education",
  entertainment: "Entertainment",
  savings: "Savings",
  other: "Other",
};

async function loadExpenses() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const expenses = await db.query.expenseTable.findMany({
    where: eq(expenseTable.userId, session.user.id),
    orderBy: desc(expenseTable.amount),
  });

  const totalMonthly = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return { expenses, totalMonthly };
}

export default async function ExpensesPage() {
  const data = await loadExpenses();

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
                      Monthly expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {formatCurrency(data.totalMonthly)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sum of all tracked expenses.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Biggest item
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {data.expenses[0] ? data.expenses[0].name : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.expenses[0]
                        ? `${labels[data.expenses[0].type as ExpenseType]} · ${formatCurrency(
                            data.expenses[0].amount
                          )}/mo`
                        : "Add an expense to see breakdown."}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tracking-tight">
                      {data.expenses.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active expense lines tracked.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="px-4 lg:px-6 space-y-4">
                <AddExpenseForm />

                {data.expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No expenses tracked yet. Add your rent, bills, and essentials to see monthly burn.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.expenses.map((expense) => (
                      <Card key={expense.id} className="bg-card/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base font-semibold">
                                {expense.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {labels[expense.type as ExpenseType]}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(expense.amount)}/mo
                            </Badge>
                          </div>
                        </CardHeader>
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
