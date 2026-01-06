import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const allowedFields = ["name", "type", "balance", "interestRate", "minimumPayment", "frequency", "dueDay"] as const;

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const debts = await db.query.debtTable.findMany({
    where: eq(debtTable.userId, session.user.id),
  });

  const header = allowedFields.join(",");
  const rows = debts.map((d) =>
    [
      d.name,
      d.type,
      Number(d.balance).toFixed(2),
      d.interestRate === null || d.interestRate === undefined ? "" : Number(d.interestRate).toFixed(2),
      d.minimumPayment === null || d.minimumPayment === undefined ? "" : Number(d.minimumPayment).toFixed(2),
      d.frequency,
      d.dueDay ?? "",
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="debts-export.csv"',
    },
  });
}
