export type SortKey = "snowball" | "low-high" | "high-low";

export type DebtLike = {
  balance: number;
  remainingBalance: number;
  type?: string | null;
  dueDay?: number | null;
};

function isCcj(debt: DebtLike) {
  return (debt.type ?? "").toLowerCase() === "ccj";
}

export function sortDebts<T extends DebtLike>(debts: T[], order: SortKey) {
  const compare = (a: T, b: T, balanceComparison: number) => {
    const aCcj = isCcj(a);
    const bCcj = isCcj(b);
    if (aCcj !== bCcj) return aCcj ? -1 : 1;
    if (balanceComparison !== 0) return balanceComparison;
    const aDue = Number.isFinite(a.dueDay) ? (a.dueDay as number) : Infinity;
    const bDue = Number.isFinite(b.dueDay) ? (b.dueDay as number) : Infinity;
    return aDue - bDue;
  };

  if (order === "low-high" || order === "snowball") {
    return [...debts].sort((a, b) => compare(a, b, a.remainingBalance - b.remainingBalance));
  }

  // high-low: largest remaining first, but CCJs stay at the top regardless
  return [...debts].sort((a, b) => compare(a, b, b.remainingBalance - a.remainingBalance));
}

export function calculateProgress(totalDebt: number, totalPaid: number) {
  return totalDebt === 0 ? 0 : Math.round((totalPaid / totalDebt) * 100);
}
