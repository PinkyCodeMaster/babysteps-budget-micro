"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  categoryOptions,
  deriveCategory,
  normalizeCurrency,
  normalizeExpenseToMonthly,
  subcategoryOptions,
  ucEligibleSubcategories,
  type ExpenseCategory,
  type ExpenseFrequency,
  type ExpenseType,
} from "@/lib/expenses";
import { formatCurrency } from "@/lib/format";

type Props = {
  expense: {
    id: number;
    name: string;
    type: ExpenseType;
    amount: number;
    category?: ExpenseCategory;
    frequency?: ExpenseFrequency;
    paymentDay?: number | null;
    paidByUc?: boolean;
  };
};

export function EditExpenseForm({ expense }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidByUc, setPaidByUc] = useState<boolean>(Boolean(expense.paidByUc));

  const initialCategory = deriveCategory(expense.category as ExpenseCategory, expense.type as ExpenseType);
  const [category, setCategory] = useState<ExpenseCategory>(initialCategory);
  const [subcategory, setSubcategory] = useState<ExpenseType>(expense.type);
  const [frequency, setFrequency] = useState<ExpenseFrequency>(expense.frequency ?? "monthly");
  const [amountInput, setAmountInput] = useState<string>(String(expense.amount ?? ""));

  const monthlyEstimate = useMemo(() => {
    const parsed = Number(amountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return normalizeExpenseToMonthly(parsed, frequency);
  }, [amountInput, frequency]);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const amount = normalizeCurrency(amountInput || formData.get("amount"));
    if (!formData.get("name") || !amount || amount <= 0) {
      setError("Please provide a name and an amount.");
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.get("name"),
      type: subcategory,
      amount,
      category,
      frequency,
      paymentDay: Number(formData.get("paymentDay")) || null,
      paidByUc: ucEligibleSubcategories.includes(subcategory) && formData.get("paidByUc") === "on",
    };

    const res = await fetch(`/api/expenses/${expense.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update expense.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
        Edit
      </Button>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await onSubmit(formData);
      }}
    >
      <Input name="name" defaultValue={expense.name} required disabled={loading} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          name="category"
          value={category}
          disabled={loading}
          onValueChange={(v) => {
            const nextCategory = v as ExpenseCategory;
            setCategory(nextCategory);
            const options = subcategoryOptions[nextCategory] ?? [];
            const currentValid = options.some((opt) => opt.id === subcategory);
            const nextSub = currentValid ? subcategory : (options[0]?.id ?? subcategory);
            if (nextSub !== subcategory) {
              setSubcategory(nextSub as ExpenseType);
            }
            if (!ucEligibleSubcategories.includes(nextSub as ExpenseType)) {
              setPaidByUc(false);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label} - {opt.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          name="subcategory"
          value={subcategory}
          disabled={loading}
          onValueChange={(v) => {
            setSubcategory(v as ExpenseType);
            setPaidByUc(false);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(subcategoryOptions[category] ?? []).map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label} - {opt.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        name="amount"
        type="number"
        min={0.01}
        step="0.01"
        required
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        disabled={loading}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Frequency</span>
        <span>
          {monthlyEstimate > 0
            ? `≈ ${formatCurrency(monthlyEstimate)}/mo${paidByUc ? " (UC-covered)" : ""}`
            : "Converted to per month"}
        </span>
      </div>

      <Select
        name="frequency"
        value={frequency}
        disabled={loading}
        onValueChange={(v) => setFrequency(v as ExpenseFrequency)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="fortnightly">Fortnightly</SelectItem>
          <SelectItem value="four_weekly">Four-weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>

      <Input
        name="paymentDay"
        type="number"
        defaultValue={expense.paymentDay ?? undefined}
        min={1}
        max={31}
        placeholder="Payment day (1-31, optional)"
        disabled={loading}
      />

      <div className="flex items-center gap-2">
        <Checkbox
          name="paidByUc"
          id={`paidByUc-${expense.id}`}
          checked={paidByUc && ucEligibleSubcategories.includes(subcategory)}
          onCheckedChange={(checked) => setPaidByUc(Boolean(checked))}
          disabled={loading || !ucEligibleSubcategories.includes(subcategory)}
        />
        <label htmlFor={`paidByUc-${expense.id}`} className="text-sm text-foreground">
          Paid by UC (deducted and excluded)
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditing(false);
            setError(null);
            setAmountInput(String(expense.amount ?? ""));
            setCategory(initialCategory);
            setSubcategory(expense.type);
            setFrequency(expense.frequency ?? "monthly");
            setPaidByUc(Boolean(expense.paidByUc));
          }}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
