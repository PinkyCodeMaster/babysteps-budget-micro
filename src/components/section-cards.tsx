import {
  IconTrendingDown,
  IconTrendingUp,
  IconTargetArrow,
  IconWallet,
  IconCurrencyPound,
  IconHomeDollar,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SectionCardsProps = {
  remainingTotal: string;
  totalPaid: string;
  paidThisMonth: string;
  nextDebtName?: string;
  nextDebtRemaining?: string;
  progressLabel: string;
  monthlyIncome?: string;
  ucPayment?: string;
  householdIncome?: string;
  monthlyExpenses?: string;
  netCashflow?: string;
  snowballAvailable?: string;
};

export function SectionCards({
  remainingTotal,
  totalPaid,
  paidThisMonth,
  nextDebtName,
  nextDebtRemaining,
  progressLabel,
  monthlyIncome,
  ucPayment,
  householdIncome,
  monthlyExpenses,
  netCashflow,
  snowballAvailable,
}: SectionCardsProps) {
  const cards = [
    {
      title: "Total Remaining",
      value: remainingTotal,
      badge: "Paying down",
      Icon: IconTrendingDown,
      meta: "Debt decreasing overall",
      sub: "Includes all active debts",
    },
    {
      title: "Paid This Month",
      value: paidThisMonth,
      badge: "Snowball + minimums",
      Icon: IconTrendingUp,
      meta: "Strong repayment month",
      sub: "Totals across all payments this month",
    },
    {
      title: "Next Debt (Snowball)",
      value: nextDebtName ?? "All paid",
      badge: nextDebtRemaining ?? "Done",
      Icon: IconTargetArrow,
      meta: nextDebtName ? "Closest to clearing" : "Snowball complete",
      sub: "Ordered by remaining balance",
    },
    {
      title: "Progress",
      value: progressLabel,
      badge: "Snowball active",
      Icon: IconWallet,
      meta: "Stay the course",
      sub: "Keep payments consistent for fastest payoff",
    },
  ];

  if (monthlyIncome) {
    cards.push({
      title: "Net Income / mo",
      value: monthlyIncome,
      badge: "Take-home",
      Icon: IconCurrencyPound,
      meta: "Salary + side gigs",
      sub: "After tax/NI for hourly & annual entries",
    });
  }

  if (householdIncome) {
    cards.push({
      title: "Household cash / mo",
      value: householdIncome,
      badge: ucPayment ? `${ucPayment} UC est.` : "UC est.",
      Icon: IconHomeDollar,
      meta: "Income + benefits",
      sub: "Based on taper settings in env",
    });
  }

  if (monthlyExpenses) {
    cards.push({
      title: "Expenses / mo",
      value: monthlyExpenses,
      badge: "Monthly outgoings",
      Icon: IconWallet,
      meta: "Rent, bills, essentials",
      sub: "All tracked expenses per month",
    });
  }

  if (netCashflow) {
    cards.push({
      title: "Cashflow / mo",
      value: netCashflow,
      badge: "Income - expenses",
      Icon: IconTrendingUp,
      meta: "Headroom to deploy",
      sub: "Use surplus to accelerate snowball",
    });
  }

  if (snowballAvailable) {
    cards.push({
      title: "Snowball extra",
      value: snowballAvailable,
      badge: "After minimums",
      Icon: IconTargetArrow,
      meta: "Cash left for debts",
      sub: "Net cashflow minus minimum payments",
    });
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
      {cards.map(({ title, value, badge, Icon, meta, sub }) => (
        <Card key={title} className="@container/card">
          <CardHeader>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Icon />
                {badge}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {meta} <Icon className="size-4" />
            </div>
            <div className="text-muted-foreground">{sub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
