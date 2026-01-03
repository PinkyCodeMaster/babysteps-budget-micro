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

type DebtSlice = {
  name: string;
  remainingBalance: number;
  minimumPayment: number;
};

type Summary = {
  snowballAvailable: number;
  totalPaid: number;
  totalDebt: number;
};

type Props = {
  debts: DebtSlice[];
  summary: Summary;
};

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function DebtsVisuals({ debts, summary }: Props) {
  const activeDebts = debts.filter((d) => d.remainingBalance > 0);

  const minBars = activeDebts.map((d) => ({
    name: d.name,
    value: d.minimumPayment,
  }));

  const progressData = [
    { name: "Paid", value: Math.max(0, summary.totalPaid) },
    { name: "Remaining", value: Math.max(0, summary.totalDebt - summary.totalPaid) },
  ];

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Debt mix</span>
          <span>{activeDebts.length ? "Remaining by debt" : "All clear"}</span>
        </div>
        <div className="h-64">
          {activeDebts.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={activeDebts} dataKey="remainingBalance" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {activeDebts.map((_, idx) => (
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
              No active debts.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Minimums</span>
          <span>{minBars.length ? "Per debt" : "Add debts"}</span>
        </div>
        <div className="h-64">
          {minBars.length ? (
            <ResponsiveContainer>
              <BarChart data={minBars} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })} />
                <Bar dataKey="value" radius={[10, 10, 6, 6]}>
                  {minBars.map((_, idx) => (
                    <Cell key={idx} fill={palette[idx % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Minimums will show when debts are added.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>Paid vs remaining</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={progressData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {progressData.map((_, idx) => (
                  <Cell key={idx} fill={palette[idx % palette.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Snowball extra available: {summary.snowballAvailable.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}.
        </p>
      </div>
    </div>
  );
}
