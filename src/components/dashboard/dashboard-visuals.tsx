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
};

type ExpenseSlice = {
  name: string;
  amount: number;
};

type Summary = {
  householdIncome: number;
  monthlyExpenses: number;
  netCashflow: number;
  snowballAvailable: number;
  totalMinimums: number;
  totalDebt: number;
  totalPaid: number;
};

type Props = {
  debts: DebtSlice[];
  expenses: ExpenseSlice[];
  summary: Summary;
};

const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function DashboardVisuals({ debts, expenses, summary }: Props) {
  const remainingByDebt = debts.filter((d) => d.remainingBalance > 0);

  const expenseTotals = Object.entries(
    expenses.reduce<Record<string, number>>((acc, exp) => {
      acc[exp.name] = (acc[exp.name] || 0) + exp.amount;
      return acc;
    }, {})
  ).map(([name, amount]) => ({ name, amount }));
  const expensesByType = expenseTotals.length ? expenseTotals : [];

  const cashflowBars = [
    { name: "Income", value: Math.max(0, summary.householdIncome) },
    { name: "Expenses", value: Math.max(0, summary.monthlyExpenses) },
    { name: "Minimums", value: Math.max(0, summary.totalMinimums) },
    { name: "Snowball", value: Math.max(0, summary.snowballAvailable) },
  ];

  const progressData = [
    { name: "Paid", value: Math.max(0, summary.totalPaid) },
    { name: "Remaining", value: Math.max(0, summary.totalDebt - summary.totalPaid) },
  ];

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-3 lg:px-6">
      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Debt mix</span>
          <span>{remainingByDebt.length ? "Remaining by debt" : "No active debts"}</span>
        </div>
        <div className="h-64">
          {remainingByDebt.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={remainingByDebt}
                  dataKey="remainingBalance"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {remainingByDebt.map((_, idx) => (
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
              Add a debt to see the breakdown.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Cashflow</span>
          <span>Income vs spend</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={cashflowBars} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number) => value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })} />
              <Bar dataKey="value" radius={[10, 10, 6, 6]}>
                {cashflowBars.map((_, idx) => (
                  <Cell key={idx} fill={palette[idx % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur lg:col-span-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Expenses</span>
          <span>{expensesByType.length ? "By category" : "No expenses yet"}</span>
        </div>
        <div className="h-72">
          {expensesByType.length ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expensesByType} dataKey="amount" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                  {expensesByType.map((_, idx) => (
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
