import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { logError } from "@/lib/logger";
import { eq } from "drizzle-orm";

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
  | "uc_advance"
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
  "uc_advance",
  "old_phone_bill",
  "rent_arrears",
  "gas_arrears",
  "electric_arrears",
  "water_arrears",
  "income_tax_arrears",
  "other",
];

const allowedFrequencies: DebtFrequency[] = ["weekly", "fortnightly", "four_weekly", "monthly", "quarterly", "yearly"];

const requiredHeaders = ["name", "type", "balance", "frequency"] as const;
const optionalHeaders = ["interestRate", "minimumPayment", "dueDay"] as const;

type DuplicateRow = {
  line: number;
  name: string;
  balance: number;
  interestRate: number | null;
  minimumPayment: number | null;
  dueDay: number | null;
  type: DebtType;
  reason: string;
};

function splitLine(line: string, delimiter: "," | "\t") {
  const regex = delimiter === "," ? /,(?=(?:[^"]*"[^"]*")*[^"]*$)/ : /\t(?=(?:[^"]*"[^"]*")*[^"]*$)/;
  return line.split(regex).map((p) => p.replace(/^"|"$/g, "").trim());
}

function parseCsv(text: string) {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { rows: [], errors: ["CSV is empty"] };

  const delimiter: "," | "\t" = lines[0].includes("\t") ? "\t" : ",";
  const header = splitLine(lines[0], delimiter).map((h) => h.toLowerCase());

  const missing = requiredHeaders.filter((h) => !header.includes(h));
  if (missing.length > 0) return { rows: [], errors: [`Missing headers: ${missing.join(", ")}`] };

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = splitLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    [...requiredHeaders, ...optionalHeaders].forEach((key) => {
      const colIndex = header.indexOf(key.toLowerCase());
      row[key] = colIndex >= 0 ? parts[colIndex] ?? "" : "";
    });
    rows.push(row);
  }
  return { rows, errors: [] };
}

export async function POST(request: Request) {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    userId = session.user.id;

    const url = new URL(request.url);
    const skipDuplicates = ["1", "true"].includes(url.searchParams.get("skipDuplicates") ?? "");

    const existing = await db.query.debtTable.findMany({
      where: eq(debtTable.userId, session.user.id),
      columns: { name: true, type: true, balance: true, interestRate: true, minimumPayment: true, dueDay: true },
    });
    const debtKey = (params: {
      name: string;
      type: DebtType;
      balance: number;
      interestRate: number | null;
      minimumPayment: number | null;
      dueDay: number | null;
    }) => {
      const rate = params.interestRate === null ? "null" : Number(params.interestRate).toFixed(2);
      const minimum = params.minimumPayment === null ? "null" : Number(params.minimumPayment).toFixed(2);
      const due = params.dueDay === null ? "null" : String(params.dueDay);
      return `${params.name.trim().toLowerCase()}|${params.type}|${params.balance.toFixed(2)}|${rate}|${minimum}|${due}`;
    };

    const existingKeys = new Set(
      existing.map((d) =>
        debtKey({
          name: d.name,
          type: d.type as DebtType,
          balance: Number(d.balance),
          interestRate: d.interestRate === null ? null : Number(d.interestRate),
          minimumPayment: d.minimumPayment === null ? null : Number(d.minimumPayment),
          dueDay: d.dueDay === null || d.dueDay === undefined ? null : Number(d.dueDay),
        })
      )
    );
    const seenKeys = new Set(existingKeys);

    const contentType = request.headers.get("content-type") || "";
    let csv = "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file || typeof file === "string") {
        return Response.json({ error: "Upload a CSV file." }, { status: 400 });
      }
      csv = await file.text();
    } else {
      csv = await request.text();
    }

    const { rows, errors } = parseCsv(csv);
    if (errors.length) return Response.json({ error: errors.join("; ") }, { status: 400 });

    const inserts: typeof debtTable.$inferInsert[] = [];
    const failures: string[] = [];
    const duplicates: DuplicateRow[] = [];

    rows.forEach((row, idx) => {
      const line = idx + 2; // account for header
      const cleanNumber = (value: string) => {
        if (value === "" || value === undefined) return "";
        return value.replace(/£|,/g, "").trim();
      };
      const name = row.name?.trim();
      const type = row.type as DebtType;
      const safeType = allowedTypes.includes(type) ? type : "other";
      const balance = Math.round(Number(cleanNumber(row.balance)) * 100) / 100;
      const interestRate =
        row.interestRate === "" ? null : Math.round(Number(cleanNumber(row.interestRate)) * 100) / 100;
      const minimumPayment =
        row.minimumPayment === "" ? null : Math.round(Number(cleanNumber(row.minimumPayment)) * 100) / 100;
      const frequency = (row.frequency || "monthly") as DebtFrequency;
      const dueDay = row.dueDay === "" ? null : Number(cleanNumber(row.dueDay));

      if (!name || !Number.isFinite(balance) || balance <= 0) {
        failures.push(`Line ${line}: invalid name/type/balance`);
        return;
      }
      if (!allowedFrequencies.includes(frequency)) {
        failures.push(`Line ${line}: invalid frequency`);
        return;
      }
      if (minimumPayment !== null && (!Number.isFinite(minimumPayment) || minimumPayment <= 0)) {
        failures.push(`Line ${line}: invalid minimumPayment`);
        return;
      }

      const duplicateKey = debtKey({
        name,
        type: safeType,
        balance,
        interestRate,
        minimumPayment,
        dueDay: Number.isInteger(dueDay) ? (dueDay as number) : null,
      });

      if (existingKeys.has(duplicateKey)) {
        duplicates.push({
          line,
          name,
          balance,
          interestRate,
          minimumPayment,
          dueDay: Number.isInteger(dueDay) ? (dueDay as number) : null,
          type: safeType,
          reason: "Matches an existing debt",
        });
        return;
      }

      if (seenKeys.has(duplicateKey)) {
        duplicates.push({
          line,
          name,
          balance,
          interestRate,
          minimumPayment,
          dueDay: Number.isInteger(dueDay) ? (dueDay as number) : null,
          type: safeType,
          reason: "Duplicate within this upload",
        });
        return;
      }

      seenKeys.add(duplicateKey);
      inserts.push({
        name,
        type: safeType,
        balance,
        interestRate: interestRate ?? null,
        minimumPayment,
        frequency,
        dueDay: Number.isInteger(dueDay) ? dueDay : null,
        userId: session.user.id,
      });
    });

    if (duplicates.length > 0 && !skipDuplicates) {
      return Response.json(
        {
          error: "We found possible duplicates. Confirm to skip them or rename in the CSV.",
          duplicates,
          readyToImport: inserts.length,
          failures,
        },
        { status: 409 }
      );
    }

    if (inserts.length === 0) {
      const message =
        duplicates.length > 0
          ? "All rows are duplicates. Rename them if they are new debts."
          : "No valid rows to import";
      return Response.json({ error: message, failures, duplicates }, { status: 400 });
    }

    await db.insert(debtTable).values(inserts);

    return Response.json({ imported: inserts.length, failures, skippedDuplicates: duplicates }, { status: 200 });
  } catch (error) {
    logError("POST /api/debts/import failed", error, { userId });
    return Response.json({ error: "Could not import debts" }, { status: 500 });
  }
}
