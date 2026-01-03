import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { debtTable } from "@/db/schema";
import { sendMail } from "@/lib/mail";
import { formatCurrency } from "@/lib/format";
import { getNextPaymentDate, type PaymentFrequency } from "@/lib/payment-schedule";
import { logError, logInfo } from "@/lib/logger";

const CRON_SECRET = process.env.CRON_SECRET;

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function verifyAuth(req: NextRequest) {
  if (!CRON_SECRET) {
    return { error: Response.json({ error: "CRON_SECRET not set" }, { status: 500 }) };
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return {};
}

export async function GET(req: NextRequest) {
  const authResult = verifyAuth(req);
  if (authResult.error) return authResult.error;
  return Response.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const authResult = verifyAuth(req);
  if (authResult.error) return authResult.error;

  try {
    const today = new Date();
    let emailsSent = 0;
    const users = await db.query.user.findMany({
      columns: { id: true, email: true, name: true, notifyEmails: true },
    });

    for (const u of users) {
      if (!u.email || u.notifyEmails === false) continue;

      const debts = await db.query.debtTable.findMany({
        where: eq(debtTable.userId, u.id),
        with: { payments: true },
      });

      if (!debts.length) continue;

      const upcoming: {
        name: string;
        due: string;
        remaining: number;
      }[] = [];
      let totalPaid = 0;
      let totalRemaining = 0;

      for (const debt of debts) {
        const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
        totalPaid += paid;
        const remaining = Math.max(0, debt.balance - paid);
        totalRemaining += remaining;

        if (!debt.dueDay) continue;

        const { adjusted } = getNextPaymentDate({
          dueDay: debt.dueDay,
          frequency: (debt.frequency as PaymentFrequency) ?? "monthly",
          from: today,
        });
        const adjustedDate = new Date(adjusted);
        const diff = daysBetween(today, adjustedDate);
        if (diff >= 0 && diff <= 3 && remaining > 0) {
          upcoming.push({
            name: debt.name,
            due: adjusted,
            remaining,
          });
        }
      }

      if (upcoming.length === 0 && totalPaid === 0) {
        continue;
      }

      const lines: string[] = [];
      if (upcoming.length) {
        lines.push("Upcoming payments (next 3 days, adjusted for holidays/weekends):");
        for (const item of upcoming) {
          lines.push(`- ${item.name}: due ${item.due} - remaining ${formatCurrency(item.remaining)}`);
        }
      }

      if (totalPaid > 0) {
        lines.push("");
        lines.push(
          `Progress so far: paid ${formatCurrency(totalPaid)} with ${formatCurrency(totalRemaining)} remaining. Keep going!`
        );
      }

      if (lines.length) {
        await sendMail({
          to: u.email,
          subject: "BabySteps: payment reminders and progress",
          text: lines.join("\n"),
          html: lines.map((l) => `<p>${l}</p>`).join(""),
        });
        emailsSent += 1;
      }
    }

    logInfo("cron/notify complete", { emailsSent });
    return Response.json({ success: true, emailsSent });
  } catch (error) {
    logError("cron/notify failed", error);
    return Response.json({ error: "Cron failed" }, { status: 500 });
  }
}
