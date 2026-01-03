import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { incomeTable } from "@/db/schema";
import { estimateNetMonthly, type IncomeType } from "@/lib/income-logic";
import { and, eq } from "drizzle-orm";

const allowedTypes: IncomeType[] = ["hourly", "monthly_net", "yearly_gross", "uc"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const incomeId = Number(id);
  if (!Number.isInteger(incomeId)) {
    return Response.json({ error: "Invalid income id" }, { status: 400 });
  }

  const income = await db.query.incomeTable.findFirst({
    where: and(eq(incomeTable.id, incomeId), eq(incomeTable.userId, session.user.id)),
  });

  if (!income) {
    return Response.json({ error: "Income not found" }, { status: 404 });
  }

  const netMonthly = estimateNetMonthly({
    type: income.type as IncomeType,
    amount: income.amount,
    hoursPerWeek: income.hoursPerWeek,
  });

  return Response.json({ ...income, netMonthly });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const incomeId = Number(id);
  if (!Number.isInteger(incomeId)) {
    return Response.json({ error: "Invalid income id" }, { status: 400 });
  }

  const body = await req.json();
  const { name, type, amount, hoursPerWeek } = body as {
    name?: string;
    type?: IncomeType;
    amount?: number;
    hoursPerWeek?: number | null;
  };

  if (!name || !type || !allowedTypes.includes(type)) {
    return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return Response.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  const updated = await db
    .update(incomeTable)
    .set({
      name,
      type,
      amount: Number(amount),
      hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
    })
    .where(and(eq(incomeTable.id, incomeId), eq(incomeTable.userId, session.user.id)))
    .returning();

  if (updated.length === 0) {
    return Response.json({ error: "Income not found" }, { status: 404 });
  }

  const income = updated[0];
  const netMonthly = estimateNetMonthly({
    type: income.type as IncomeType,
    amount: income.amount,
    hoursPerWeek: income.hoursPerWeek,
  });

  return Response.json({ ...income, netMonthly });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const incomeId = Number(id);
  if (!Number.isInteger(incomeId)) {
    return Response.json({ error: "Invalid income id" }, { status: 400 });
  }

  const deleted = await db
    .delete(incomeTable)
    .where(and(eq(incomeTable.id, incomeId), eq(incomeTable.userId, session.user.id)))
    .returning({ id: incomeTable.id });

  if (deleted.length === 0) {
    return Response.json({ error: "Income not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
