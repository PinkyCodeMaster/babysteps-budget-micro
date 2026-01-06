"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ExpenseSlice = {
  name: string;
  amount?: number;
  monthlyAmount?: number;
  monthlyOutOfPocket?: number;
  type: string;
  paidByUc?: boolean;
};

type Props = {
  expenses: ExpenseSlice[];
};

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function ExpensesVisuals({ expenses }: Props) {
  const byType = Object.entries(
    expenses.reduce<Record<string, number>>((acc, exp) => {
      const value =
        exp.monthlyOutOfPocket ??
        exp.monthlyAmount ??
        exp.amount ??
        0;
      acc[exp.type] = (acc[exp.type] || 0) + value;
      return acc;
    }, {})
  ).map(([type, amount]) => ({ name: type, value: amount }));

  const topExpenses = [...expenses]
    .map((exp) => ({
      name: exp.name,
      amount: exp.monthlyOutOfPocket ?? exp.monthlyAmount ?? exp.amount ?? 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Top expenses</span>
          <span>{topExpenses.length ? "Monthly out-of-pocket" : "Add an expense"}</span>
        </div>
        <div className="h-64">
          {topExpenses.length ? (
            <ResponsiveContainer>
              <BarChart data={topExpenses} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })} />
                <Bar dataKey="amount" radius={[10, 10, 6, 6]}>
                  {topExpenses.map((_, idx) => (
                    <Cell key={idx} fill={palette[idx % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Add expenses to see the biggest items.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>By category</span>
          <span>{byType.length ? "Share of spend" : "Awaiting entries"}</span>
        </div>
        <div className="h-64">
          {byType.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {byType.map((_, idx) => (
                    <Cell key={idx} fill={palette[idx % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Add expenses to see where money goes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
