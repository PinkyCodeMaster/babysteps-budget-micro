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
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { formatCurrency } from "@/lib/format";
import { calculateProgress, sortDebts, type SortKey } from "@/lib/debt-logic";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
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

type DashboardData = {
  summary: {
    totalDebt: number;
    totalPaid: number;
    paidThisMonth: number;
    progressPercent: number;
  };
  debts: DebtWithTotals[];
};

async function loadDebtData(sort: SortKey): Promise<DashboardData> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const debts = await db.query.debtTable.findMany({
    with: { payments: true },
    where: eq(debtTable.userId, session.user.id),
  });

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
    summary: { totalDebt, totalPaid, paidThisMonth, progressPercent },
    debts: sortedDebts,
  };
}

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: sortParam } = await searchParams;
  const sortKey: SortKey =
    sortParam === "low-high" || sortParam === "high-low" || sortParam === "snowball"
      ? sortParam
      : "snowball";

  const data = await loadDebtData(sortKey);
  const nextDebt = data.debts[0];

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
              <SectionCards
                remainingTotal={formatCurrency(data.summary.totalDebt - data.summary.totalPaid)}
                totalPaid={formatCurrency(data.summary.totalPaid)}
                paidThisMonth={formatCurrency(data.summary.paidThisMonth)}
                progressLabel={`${data.summary.progressPercent}%`}
              />
              <div className="px-4 lg:px-6 space-y-4">
                <AddDebtPanel />
                {data.debts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No debts yet. Add one to get started.</p>
                )}
                {data.debts.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex flex-col gap-3 rounded-md border bg-card/50 p-4"
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
                      <AddPaymentForm
                        debtId={debt.id}
                        remainingBalance={debt.remainingBalance}
                      />
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
