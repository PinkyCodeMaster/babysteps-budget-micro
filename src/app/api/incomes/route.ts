import { auth } from "@/lib/auth";
import { calculateProgress } from "@/lib/debt-logic";
import { formatCurrency } from "@/lib/format";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

type IncomeType = "hourly" | "monthly_net" | "yearly_gross" | "uc";

function estimateNetMonthly({
  type,
  amount,
  hoursPerWeek,
}: {
  type: IncomeType;
  amount: number;
  hoursPerWeek?: number | null;
}) {
  const personalAllowance = 12570;
  const basicRateLimit = 50270;
  const higherRateLimit = 125140;

  const computeNetFromGross = (grossYear: number) => {
    const taxable = Math.max(0, grossYear - personalAllowance);
    const basic = Math.min(basicRateLimit - personalAllowance, taxable);
    const higher = Math.min(
      Math.max(0, higherRateLimit - basicRateLimit),
      Math.max(0, taxable - basic)
    );
    const addl = Math.max(0, taxable - basic - higher);

    const tax = basic * 0.2 + higher * 0.4 + addl * 0.45;

    const niThreshold = 12570;
    const niUpper = 50270;
    const niBand1 = Math.min(Math.max(0, grossYear - niThreshold), niUpper - niThreshold);
    const niBand2 = Math.max(0, grossYear - niUpper);
    const ni = niBand1 * 0.12 + niBand2 * 0.02;

    return grossYear - tax - ni;
  };

  if (type === "monthly_net" || type === "uc") {
    return amount;
  }

  if (type === "hourly") {
    const hours = hoursPerWeek ?? 0;
    const grossYear = amount * hours * 52;
    return computeNetFromGross(grossYear) / 12;
  }

  // yearly_gross
  return computeNetFromGross(amount) / 12;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const incomes = await db.query.incomeTable.findMany({
    where: eq(incomeTable.userId, session.user.id),
  });

  const enriched = incomes.map((income) => {
    const netMonthly = estimateNetMonthly({
      type: income.type as IncomeType,
      amount: income.amount,
      hoursPerWeek: income.hoursPerWeek,
    });
    return { ...income, netMonthly };
  });

  const totalNetMonthly = enriched.reduce((sum, inc) => sum + inc.netMonthly, 0);

  const ucBase = Number(process.env.UC_BASE_MONTHLY ?? 0);
  const taperIgnore = Number(process.env.UC_TAPER_DISREGARD ?? 411);
  const taperRate = Number(process.env.UC_TAPER_RATE ?? 0.55);
  const takeHome = enriched
    .filter((inc) => inc.type !== "uc")
    .reduce((sum, inc) => sum + inc.netMonthly, 0);
  const deduction = Math.max(0, (takeHome - taperIgnore) * taperRate);
  const ucPayment = Math.max(0, ucBase - deduction);

  return Response.json({
    summary: {
      totalNetMonthly,
      ucPayment,
    },
    incomes: enriched,
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, type, amount, hoursPerWeek } = body as {
    name: string;
    type: IncomeType;
    amount: number;
    hoursPerWeek?: number;
  };

  if (!name || !type || !Number.isFinite(Number(amount)) || amount <= 0) {
    return Response.json({ error: "Invalid income data" }, { status: 400 });
  }

  await db.insert(incomeTable).values({
    name,
    type,
    amount: Number(amount),
    hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
    userId: session.user.id,
  });

  return Response.json({ success: true }, { status: 201 });
}
