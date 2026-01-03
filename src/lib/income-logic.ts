export type IncomeType = "hourly" | "monthly_net" | "yearly_gross" | "uc";

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

export function calculateUcPayment({
  incomes,
  base = 0,
  taperIgnore = 411,
  taperRate = 0.55,
}: {
  incomes: { type: IncomeType; netMonthly: number }[];
  base?: number;
  taperIgnore?: number;
  taperRate?: number;
}) {
  const declaredUc = incomes.find((inc) => inc.type === "uc");
  const effectiveBase = declaredUc ? declaredUc.netMonthly : base;

  const takeHome = incomes
    .filter((inc) => inc.type !== "uc")
    .reduce((sum, inc) => sum + inc.netMonthly, 0);

  const deduction = Math.max(0, (takeHome - taperIgnore) * taperRate);
  return Math.max(0, effectiveBase - deduction);
}
