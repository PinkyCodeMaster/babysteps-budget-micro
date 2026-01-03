import { addMonths, addWeeks, startOfDay } from "date-fns";

export type PaymentFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

// Minimal UK bank holidays list; extend as needed. Format: YYYY-MM-DD.
const UK_BANK_HOLIDAYS = new Set<string>([
  "2025-01-01",
  "2025-04-18",
  "2025-04-21",
  "2025-05-05",
  "2025-05-26",
  "2025-08-25",
  "2025-12-25",
  "2025-12-26",
  "2026-01-01",
  "2026-04-03",
  "2026-04-06",
  "2026-05-04",
  "2026-05-25",
  "2026-08-31",
  "2026-12-25",
  "2026-12-28",
]);

function formatISO(date: Date) {
  return date.toISOString().split("T")[0];
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(date: Date, holidays: Set<string>) {
  return holidays.has(formatISO(date));
}

function nextWorkingDay(date: Date, holidays: Set<string>) {
  const candidate = new Date(date);
  while (isWeekend(candidate) || isHoliday(candidate, holidays)) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

function baseDateFromDueDay(from: Date, dueDay: number, frequency: PaymentFrequency) {
  const base = new Date(from);
  if (frequency === "weekly") {
    return addWeeks(startOfDay(base), 1);
  }
  if (frequency === "fortnightly") {
    return addWeeks(startOfDay(base), 2);
  }
  if (frequency === "four_weekly") {
    return addWeeks(startOfDay(base), 4);
  }
  if (frequency === "quarterly") {
    const candidate = new Date(base.getFullYear(), base.getMonth(), dueDay);
    if (candidate <= base) {
      candidate.setMonth(candidate.getMonth() + 3);
    }
    return candidate;
  }
  if (frequency === "yearly") {
    const candidate = new Date(base.getFullYear(), base.getMonth(), dueDay);
    if (candidate <= base) {
      candidate.setFullYear(candidate.getFullYear() + 1);
    }
    return candidate;
  }

  // Monthly default.
  const candidate = new Date(base.getFullYear(), base.getMonth(), dueDay);
  if (candidate <= base) {
    return addMonths(candidate, 1);
  }
  return candidate;
}

export function getNextPaymentDate({
  dueDay,
  frequency = "monthly",
  from = new Date(),
  holidays = UK_BANK_HOLIDAYS,
}: {
  dueDay: number;
  frequency?: PaymentFrequency;
  from?: Date;
  holidays?: Set<string>;
}) {
  const base = baseDateFromDueDay(from, dueDay, frequency);
  const adjusted = nextWorkingDay(base, holidays);
  return { base: formatISO(base), adjusted: formatISO(adjusted), adjustedDate: adjusted };
}
