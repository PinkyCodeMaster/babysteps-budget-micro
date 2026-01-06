import { addMonths, addWeeks, startOfDay } from "date-fns";

export type PaymentFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";
type AdjustDirection = "forward" | "backward";

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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(date: Date, holidays: Set<string>) {
  return holidays.has(formatISO(date));
}

function adjustWorkingDay(date: Date, holidays: Set<string>, direction: AdjustDirection = "forward") {
  const candidate = new Date(date);
  const delta = direction === "forward" ? 1 : -1;
  while (isWeekend(candidate) || isHoliday(candidate, holidays)) {
    candidate.setDate(candidate.getDate() + delta);
  }
  return candidate;
}

function baseDateFromDueDay(from: Date, dueDay: number, frequency: PaymentFrequency) {
  const base = new Date(from);
  if (frequency === "weekly") {
    const targetDow = dueDay >= 1 && dueDay <= 7 ? dueDay : base.getDay() || 7; // Monday=1 ... Sunday=7
    const currentDow = base.getDay() === 0 ? 7 : base.getDay();
    const diff = targetDow - currentDow;
    const candidate = startOfDay(base);
    candidate.setDate(candidate.getDate() + (diff >= 0 ? diff : diff + 7));
    if (candidate <= base) {
      candidate.setDate(candidate.getDate() + 7);
    }
    return candidate;
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
  mode = "forward",
  useLastWorkingDay = false,
  frequency = "monthly",
  from = new Date(),
  holidays = UK_BANK_HOLIDAYS,
}: {
  dueDay: number;
  mode?: AdjustDirection;
  useLastWorkingDay?: boolean;
  frequency?: PaymentFrequency;
  from?: Date;
  holidays?: Set<string>;
}) {
  let base: Date;

  if (useLastWorkingDay && frequency === "monthly") {
    const month = from.getMonth();
    const year = from.getFullYear();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const lastWorkingThisMonth = adjustWorkingDay(lastDayOfMonth, holidays, "backward");
    if (lastWorkingThisMonth > from) {
      base = lastWorkingThisMonth;
    } else {
      const nextMonthLast = new Date(year, month + 2, 0);
      base = adjustWorkingDay(nextMonthLast, holidays, "backward");
    }
  } else {
    base = baseDateFromDueDay(from, dueDay, frequency);
  }

  const adjusted = adjustWorkingDay(base, holidays, mode);
  return { base: formatISO(base), adjusted: formatISO(adjusted), adjustedDate: adjusted };
}
