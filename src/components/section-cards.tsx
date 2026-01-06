import { IconTrendingDown, IconTrendingUp, IconTargetArrow, IconWallet } from "@tabler/icons-react";

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
  paidThisMonth: string;
  totalPaid?: string;
  snowballAvailable?: string;
  progressLabel: string;
  monthlyIncome?: string;
  monthlyExpenses?: string;
};

export function SectionCards(props: SectionCardsProps) {
  const { remainingTotal, paidThisMonth, totalPaid, snowballAvailable, progressLabel, monthlyIncome, monthlyExpenses } =
    props;
  const cards = [
    {
      title: "Remaining",
      value: remainingTotal,
      badge: "All debts",
      Icon: IconTrendingDown,
      meta: "Chipping away",
      sub: "",
    },
    {
      title: "Paid this month",
      value: paidThisMonth,
      badge: "Momentum",
      Icon: IconTrendingUp,
      meta: "Keep the rhythm",
      sub: "",
    },
  ];

  if (totalPaid) {
    cards.push({
      title: "Paid to date",
      value: totalPaid,
      badge: "Lifetime",
      Icon: IconWallet,
      meta: "Forward motion",
      sub: "",
    });
  }

  if (monthlyIncome) {
    cards.push({
      title: "Monthly income",
      value: monthlyIncome,
      badge: "Take-home",
      Icon: IconTrendingUp,
      meta: "What you bring in",
      sub: "",
    });
  }

  if (monthlyExpenses) {
    cards.push({
      title: "Monthly outgoings",
      value: monthlyExpenses,
      badge: "Spend",
      Icon: IconTrendingDown,
      meta: "What leaves",
      sub: "",
    });
  }

  if (snowballAvailable) {
    cards.push({
      title: "Snowball ready",
      value: snowballAvailable,
      badge: "After minimums",
      Icon: IconTargetArrow,
      meta: "Extra you can apply",
      sub: "",
    });
  }

  cards.push({
    title: "Progress",
    value: progressLabel,
    badge: "Stay the course",
    Icon: IconWallet,
    meta: "Consistency wins",
    sub: "",
  });

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
      {cards.map(({ title, value, badge, Icon, meta, sub }) => (
        <Card key={title} className="@container/card border border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
          <CardHeader className="gap-2">
            <CardDescription className="text-[13px] font-medium text-muted-foreground">
              {title}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {value}
            </CardTitle>
            <CardAction className="mt-1">
              <Badge variant="outline" className="gap-1.5 text-xs">
                <Icon className="size-4" />
                {badge}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm text-muted-foreground">
            <div className="line-clamp-2 flex gap-2 font-medium text-foreground">
              {meta} <Icon className="size-4 text-primary" />
            </div>
            {sub && <div>{sub}</div>}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
