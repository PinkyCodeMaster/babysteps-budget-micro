import {
  IconTrendingDown,
  IconTrendingUp,
  IconTargetArrow,
  IconWallet,
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
};

export function SectionCards({
  remainingTotal,
  totalPaid,
  paidThisMonth,
  nextDebtName,
  nextDebtRemaining,
  progressLabel,
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Remaining</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {remainingTotal}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              Paying down
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Debt decreasing overall <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Includes all active debts</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Paid This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {paidThisMonth}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Snowball + minimums
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong repayment month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Totals across all payments this month
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Next Debt (Snowball)</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {nextDebtName ?? "All paid"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTargetArrow />
              {nextDebtRemaining ?? "Done"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {nextDebtName ? "Closest to clearing" : "Snowball complete"}{" "}
            <IconTargetArrow className="size-4" />
          </div>
          <div className="text-muted-foreground">Ordered by remaining balance</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Progress</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {progressLabel}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconWallet />
              Snowball active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Stay the course <IconWallet className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Keep payments consistent for fastest payoff
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
