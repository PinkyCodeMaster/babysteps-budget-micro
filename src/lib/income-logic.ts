export type IncomeType = "hourly" | "monthly_net" | "yearly_gross" | "uc";
export type IncomeCategory =
  | "wage"
  | "benefit"
  | "uc"
  | "disability_pension"
  | "side_gig"
  | "second_job"
  | "other";
export type PaymentFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";
export type PaymentDayRule = "specific_day" | "last_working_day" | "last_friday" | "last_thursday";
export type IncomeBasis =
  | "monthly_net"
  | "weekly_net"
  | "fortnightly_net"
  | "four_weekly_net"
  | "yearly_gross"
  | "hourly"
  | "uc";

export const defaultHoursGuess = 37.5;

export function normalizeIncomeAmount(amount: number, basis: IncomeBasis) {
  const safe = Number(amount);
  if (!Number.isFinite(safe)) return 0;
  switch (basis) {
    case "weekly_net":
      return (safe * 52) / 12;
    case "fortnightly_net":
      return (safe * 26) / 12;
    case "four_weekly_net":
      return (safe * 13) / 12;
    default:
      return safe;
  }
}

export function denormalizeIncomeAmount(amount: number, basis: IncomeBasis) {
  const safe = Number(amount);
  if (!Number.isFinite(safe)) return 0;
  switch (basis) {
    case "weekly_net":
      return (safe * 12) / 52;
    case "fortnightly_net":
      return (safe * 12) / 26;
    case "four_weekly_net":
      return (safe * 12) / 13;
    default:
      return safe;
  }
}

export function inferBasisFromIncome(input: { type: IncomeType; frequency?: PaymentFrequency | null }): IncomeBasis {
  if (input.type === "hourly") return "hourly";
  if (input.type === "yearly_gross") return "yearly_gross";
  if (input.type === "uc") return "uc";

  switch (input.frequency) {
    case "weekly":
      return "weekly_net";
    case "fortnightly":
      return "fortnightly_net";
    case "four_weekly":
      return "four_weekly_net";
    default:
      return "monthly_net";
  }
}

export function incomeTypeFromBasis(basis: IncomeBasis): IncomeType {
  if (basis === "hourly") return "hourly";
  if (basis === "yearly_gross") return "yearly_gross";
  if (basis === "uc") return "uc";
  return "monthly_net";
}

const personalAllowance = 12570;
const basicRateLimit = 50270;
const higherRateLimit = 125140;
const niThreshold = 12570;
const niUpper = 50270;

function computeNetFromGrossYear(grossYear: number) {
  const taxable = Math.max(0, grossYear - personalAllowance);
  const basic = Math.min(basicRateLimit - personalAllowance, taxable);
  const higher = Math.min(Math.max(0, higherRateLimit - basicRateLimit), Math.max(0, taxable - basic));
  const addl = Math.max(0, taxable - basic - higher);

  const tax = basic * 0.2 + higher * 0.4 + addl * 0.45;

  const niBand1 = Math.min(Math.max(0, grossYear - niThreshold), niUpper - niThreshold);
  const niBand2 = Math.max(0, grossYear - niUpper);
  const ni = niBand1 * 0.12 + niBand2 * 0.02;

  return grossYear - tax - ni;
}

// Estimate net monthly income from the stored amount and type.
export function estimateNetMonthly({
  type,
  amount,
  hoursPerWeek,
}: {
  type: IncomeType;
  amount: number;
  hoursPerWeek?: number | null;
}) {
  if (type === "monthly_net" || type === "uc") {
    return amount;
  }

  if (type === "hourly") {
    const hours = hoursPerWeek ?? 0;
    const grossYear = amount * hours * 52;
    return computeNetFromGrossYear(grossYear) / 12;
  }

  // yearly_gross
  return computeNetFromGrossYear(amount) / 12;
}

export function previewNetMonthly({
  basis,
  type,
  amount,
  hoursPerWeek,
}: {
  basis: IncomeBasis;
  type: IncomeType;
  amount: number;
  hoursPerWeek?: number | null;
}) {
  if (basis === "yearly_gross" || type === "yearly_gross") {
    return estimateNetMonthly({ type: "yearly_gross", amount, hoursPerWeek });
  }
  if (basis === "hourly" || type === "hourly") {
    return estimateNetMonthly({ type: "hourly", amount, hoursPerWeek });
  }
  const normalized = normalizeIncomeAmount(amount, basis);
  const resolvedType = type === "uc" ? "uc" : "monthly_net";
  return estimateNetMonthly({ type: resolvedType, amount: normalized });
}

const defaultTaxableCategories: IncomeCategory[] = ["wage", "side_gig", "second_job"];

export function calculateUcPayment({
  incomes,
  base = 0,
  taperIgnore = 411,
  taperRate = 0.55,
  paidByUcMonthly = 0,
  taxableCategories = defaultTaxableCategories,
}: {
  incomes: { type: IncomeType; netMonthly: number; category?: IncomeCategory | null }[];
  base?: number;
  taperIgnore?: number;
  taperRate?: number;
  paidByUcMonthly?: number;
  taxableCategories?: IncomeCategory[];
}) {
  const declaredUc = incomes.find((inc) => inc.type === "uc");
  const effectiveBase = declaredUc && Number.isFinite(declaredUc.netMonthly) ? declaredUc.netMonthly : base;

  const taxableSet = new Set<IncomeCategory>(taxableCategories);
  const taxableTakeHome = incomes
    .filter((inc) => inc.type !== "uc")
    .filter((inc) => {
      const cat = (inc.category ?? "wage") as IncomeCategory;
      return taxableSet.has(cat);
    })
    .reduce((sum, inc) => sum + (Number.isFinite(inc.netMonthly) ? inc.netMonthly : 0), 0);

  const safeIgnore = Number.isFinite(taperIgnore) ? taperIgnore : 411;
  const safeTaper = Number.isFinite(taperRate) ? taperRate : 0.55;
  const deduction = Math.max(0, (taxableTakeHome - safeIgnore) * safeTaper);
  const directPayments = Number.isFinite(paidByUcMonthly) ? paidByUcMonthly : 0;
  return Math.max(0, effectiveBase - deduction - directPayments);
}
