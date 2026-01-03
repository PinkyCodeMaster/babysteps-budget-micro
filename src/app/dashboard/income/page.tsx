import { AppSidebar } from "@/components/app-sidebar";
import { AddIncomeForm } from "@/components/dashboard/add-income-form";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import {
  estimateNetMonthly,
  calculateUcPayment,
  type IncomeType,
} from "@/lib/income-logic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type React from "react";

type IncomeWithNet = {
  id: number;
  name: string;
  type: IncomeType;
  amount: number;
  hoursPerWeek: number | null;
  netMonthly: number;
};

const incomeLabels: Record<IncomeType, string> = {
  hourly: "Hourly (gross)",
  monthly_net: "Monthly (net)",
  yearly_gross: "Yearly (gross)",
  uc: "Universal Credit (net)",
};

async function loadIncomeData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const incomes = await db.query.incomeTable.findMany({
    where: eq(incomeTable.userId, session.user.id),
  });

  const enriched: IncomeWithNet[] = incomes.map((income) => ({
    ...income,
    netMonthly: estimateNetMonthly({
      type: income.type as IncomeType,
      amount: income.amount,
      hoursPerWeek: income.hoursPerWeek,
    }),
  }));

  const totalNetMonthly = enriched.reduce((sum, inc) => sum + inc.netMonthly, 0);

  const ucBase = Number(process.env.UC_BASE_MONTHLY ?? 0);
  const taperIgnore = Number(process.env.UC_TAPER_DISREGARD ?? 411);
  const taperRate = Number(process.env.UC_TAPER_RATE ?? 0.55);
  const ucPayment = calculateUcPayment({
    incomes: enriched,
    base: ucBase,
    taperIgnore,
    taperRate,
  });

  return {
    incomes: enriched,
    summary: {
      totalNetMonthly,
      ucPayment,
      householdMonthly: totalNetMonthly + ucPayment,
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
              <div className="grid gap-3 px-4 md:grid-cols-3 lg:px-6">
                <Card>
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
                <Card>
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
                      Based on base, taper, and disregard in env.
                    </p>
                  </CardContent>
                </Card>
                <Card>
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
                      Take-home + UC for this account.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="px-4 lg:px-6 space-y-4">
                <AddIncomeForm />

                {data.incomes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No incomes yet. Add one to start projecting your monthly cash.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.incomes.map((income) => (
                      <Card key={income.id} className="bg-card/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base font-semibold">
                                {income.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {incomeLabels[income.type]}
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
                              {formatCurrency(income.amount)}
                              {income.type === "hourly"
                                ? "/hr"
                                : income.type === "yearly_gross"
                                ? "/yr gross"
                                : "/mo"}
                            </span>
                          </div>
                          {income.type === "hourly" && income.hoursPerWeek && (
                            <div className="flex items-center justify-between">
                              <span>Hours per week</span>
                              <span className="font-medium text-foreground">
                                {income.hoursPerWeek}
                              </span>
                            </div>
                          )}
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
