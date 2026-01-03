import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type DebtType =
  | "credit_card"
  | "personal_loan"
  | "loan"
  | "mortgage"
  | "car_finance"
  | "overdraft"
  | "payday"
  | "utility_arrears"
  | "council_tax"
  | "tax_arrears"
  | "student_loan"
  | "store_card"
  | "hire_purchase"
  | "ccj"
  | "old_phone_bill"
  | "rent_arrears"
  | "gas_arrears"
  | "electric_arrears"
  | "water_arrears"
  | "income_tax_arrears"
  | "other";

type DebtFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

const allowedTypes: DebtType[] = [
  "credit_card",
  "personal_loan",
  "loan",
  "mortgage",
  "car_finance",
  "overdraft",
  "payday",
  "utility_arrears",
  "council_tax",
  "tax_arrears",
  "student_loan",
  "store_card",
  "hire_purchase",
  "ccj",
  "old_phone_bill",
  "rent_arrears",
  "gas_arrears",
  "electric_arrears",
  "water_arrears",
  "income_tax_arrears",
  "other",
];

const allowedFrequencies: DebtFrequency[] = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"];

function safeDay(value?: number | null) {
  if (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31) {
    return Number(value);
  }
  return null;
}

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

    const { name, type, balance, interestRate, minimumPayment, frequency, dueDay } = body as Partial<{
      name: string;
      type: DebtType;
      balance: number;
      interestRate: number | null;
      minimumPayment: number;
      frequency: DebtFrequency;
      dueDay: number | null;
    }>;

    if (!name || name.length > 255 || !type || !allowedTypes.includes(type)) {
      return Response.json({ error: "Please provide a valid name and type." }, { status: 400 });
    }

    if (!Number.isFinite(Number(balance)) || Number(balance) <= 0) {
      return Response.json({ error: "Please provide a valid balance." }, { status: 400 });
    }

    if (!Number.isFinite(Number(minimumPayment)) || Number(minimumPayment) <= 0) {
      return Response.json({ error: "Minimum payment must be greater than zero." }, { status: 400 });
    }

    const safeFrequency = allowedFrequencies.includes(frequency as DebtFrequency) ? (frequency as DebtFrequency) : "monthly";
    const safeDueDay = safeDay(dueDay);

    const sanitized: typeof debtTable.$inferInsert = {
      name,
      type,
      balance: Number(balance),
      interestRate: interestRate === undefined || interestRate === null ? null : Number(interestRate),
      minimumPayment: Number(minimumPayment),
      frequency: safeFrequency,
      dueDay: safeDueDay,
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
