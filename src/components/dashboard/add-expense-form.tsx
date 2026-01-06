"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  categoryOptions,
  normalizeCurrency,
  normalizeExpenseToMonthly,
  subcategoryOptions,
  ucEligibleSubcategories,
  type ExpenseCategory,
  type ExpenseFrequency,
  type ExpenseType,
} from "@/lib/expenses";
import { formatCurrency } from "@/lib/format";

export function AddExpenseForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidByUc, setPaidByUc] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("housing");
  const [subcategory, setSubcategory] = useState<ExpenseType>("rent");
  const [frequency, setFrequency] = useState<ExpenseFrequency>("monthly");
  const [amountInput, setAmountInput] = useState<string>("");

  const monthlyEstimate = useMemo(() => {
    const parsed = Number(amountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return normalizeExpenseToMonthly(parsed, frequency);
  }, [amountInput, frequency]);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const amount = normalizeCurrency(formData.get("amount"));
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
      paymentDay: Number(formData.get("paymentDay")) || undefined,
      paidByUc: ucEligibleSubcategories.includes(subcategory) && formData.get("paidByUc") === "on",
    };

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Please check the expense details and try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    (formRef.current as HTMLFormElement | null)?.reset();
    setCategory("housing");
    setSubcategory("rent");
    setFrequency("monthly");
    setPaidByUc(false);
    setAmountInput("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await onSubmit(formData);
          }}
        >
          <Input name="name" placeholder="Expense name (e.g. Rent)" required disabled={loading} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Select
                name="category"
                required
                disabled={loading}
                value={category}
                onValueChange={(v) => {
                  const nextCategory = v as ExpenseCategory;
                  setCategory(nextCategory);
                  const options = subcategoryOptions[nextCategory];
                  if (options && options.length > 0) {
                    setSubcategory(options[0].id);
                    setPaidByUc(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label} - {opt.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Select
                name="subcategory"
                required
                disabled={loading}
                value={subcategory}
                onValueChange={(v) => {
                  setSubcategory(v as ExpenseType);
                  setPaidByUc(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Subcategory" />
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
          </div>

          <Input
            name="amount"
            type="number"
            placeholder="Amount (enter the value you pay each period)"
            required
            min={0.01}
            step="0.01"
            disabled={loading}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Frequency</span>
            <span>
              {monthlyEstimate > 0
                ? `≈ ${formatCurrency(monthlyEstimate)}/mo${paidByUc ? " (UC-covered)" : ""}`
                : "We will convert it to per month"}
            </span>
          </div>
          <Select
            name="frequency"
            required
            disabled={loading}
            value={frequency}
            onValueChange={(v) => setFrequency(v as ExpenseFrequency)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment frequency" />
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
            min={1}
            max={31}
            placeholder="Payment day (1-31, optional)"
            disabled={loading}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              name="paidByUc"
              id="paidByUc"
              checked={paidByUc && ucEligibleSubcategories.includes(subcategory)}
              onCheckedChange={(checked) => setPaidByUc(Boolean(checked))}
              disabled={loading || !ucEligibleSubcategories.includes(subcategory)}
            />
            <label htmlFor="paidByUc" className="text-sm text-foreground">
              Paid by UC (deducted from UC and excluded from outgoings)
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
