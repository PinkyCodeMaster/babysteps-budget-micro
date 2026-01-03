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

type IncomeSlice = {
  name: string;
  netMonthly: number;
  type: string;
};

type Props = {
  incomes: IncomeSlice[];
};

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function IncomeVisuals({ incomes }: Props) {
  const pieData = Object.entries(
    incomes.reduce<Record<string, number>>((acc, inc) => {
      acc[inc.type] = (acc[inc.type] || 0) + inc.netMonthly;
      return acc;
    }, {})
  ).map(([type, net]) => ({ name: type, value: net }));

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Net per source</span>
          <span>{incomes.length ? "Monthly view" : "Add an income"}</span>
        </div>
        <div className="h-64">
          {incomes.length ? (
            <ResponsiveContainer>
              <BarChart data={incomes} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })} />
                <Bar dataKey="netMonthly" radius={[10, 10, 6, 6]}>
                  {incomes.map((_, idx) => (
                    <Cell key={idx} fill={palette[idx % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Add income to see monthly amounts.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Share by type</span>
          <span>{pieData.length ? "Net monthly split" : "Awaiting entries"}</span>
        </div>
        <div className="h-64">
          {pieData.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {pieData.map((_, idx) => (
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
              Add income types to see the mix.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
