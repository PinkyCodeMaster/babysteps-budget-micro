import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Listing debts is handled inside server components to avoid a broad "get all" API.
export async function GET() {
  return Response.json({ error: "Listing debts is not available via this endpoint." }, { status: 405 });
}

// Creates a debt; numeric fields validated server-side and scoped to the signed-in user.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { name, type, balance, interestRate, minimumPayment } = body;

    if (!name || !Number.isFinite(Number(balance)) || Number(balance) <= 0) {
      return Response.json(
        { error: "Please provide a valid name and balance." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(Number(minimumPayment)) || Number(minimumPayment) <= 0) {
      return Response.json(
        { error: "Minimum payment must be greater than zero." },
        { status: 400 }
      );
    }

    const sanitized: typeof debtTable.$inferInsert = {
      name,
      type,
      balance: Number(balance),
      interestRate: interestRate === undefined || interestRate === null ? null : Number(interestRate),
      minimumPayment: Number(minimumPayment),
      userId: session.user.id,
    };

    const [created] = await db
      .insert(debtTable)
      .values(sanitized)
      .returning({ id: debtTable.id });

    return Response.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/debts failed", error);
    return Response.json({ error: "We couldn't save that debt. Please try again." }, { status: 500 });
  }
}
