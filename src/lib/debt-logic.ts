export type SortKey = "snowball" | "low-high" | "high-low";

export type DebtLike = {
  balance: number;
  remainingBalance: number;
};

export function sortDebts<T extends DebtLike>(debts: T[], order: SortKey) {
  if (order === "low-high") {
    return [...debts].sort((a, b) => a.remainingBalance - b.remainingBalance);
  }
  if (order === "high-low") {
    return [...debts].sort((a, b) => b.remainingBalance - a.remainingBalance);
  }
  // default snowball: smallest remaining balance first
  return [...debts].sort((a, b) => a.remainingBalance - b.remainingBalance);
}

export function calculateProgress(totalDebt: number, totalPaid: number) {
  return totalDebt === 0 ? 0 : Math.round((totalPaid / totalDebt) * 100);
}
