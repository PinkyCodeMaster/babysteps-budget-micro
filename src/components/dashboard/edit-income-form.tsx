"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  defaultHoursGuess,
  denormalizeIncomeAmount,
  incomeTypeFromBasis,
  inferBasisFromIncome,
  previewNetMonthly,
  type IncomeBasis,
  type IncomeCategory,
  type IncomeType,
  type PaymentDayRule,
  type PaymentFrequency,
} from "@/lib/income-logic";
import { formatCurrency } from "@/lib/format";

type Props = {
  income: {
    id: number;
    name: string;
    type: IncomeType;
    amount: number;
    hoursPerWeek: number | null;
    category?: IncomeCategory | null;
    frequency?: PaymentFrequency | null;
    paymentDay?: number | null;
    paymentDayRule?: PaymentDayRule | null;
  };
};

const basisOptions: { value: IncomeBasis; label: string }[] = [
  { value: "monthly_net", label: "Monthly take-home" },
  { value: "weekly_net", label: "Weekly take-home" },
  { value: "fortnightly_net", label: "Bi-weekly take-home" },
  { value: "four_weekly_net", label: "Four-weekly take-home" },
  { value: "yearly_gross", label: "Yearly gross (before tax)" },
  { value: "hourly", label: "Hourly (gross)" },
  { value: "uc", label: "Universal Credit" },
];

const frequencyOptions: { value: PaymentFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Bi-weekly" },
  { value: "four_weekly", label: "Four-weekly" },
  { value: "monthly", label: "Monthly" },
];

export function EditIncomeForm({ income }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialBasis: IncomeBasis = inferBasisFromIncome(income);
  const [basis, setBasis] = useState<IncomeBasis>(initialBasis);
  const [frequency, setFrequency] = useState<PaymentFrequency>(income.frequency ?? "monthly");
  const [dayRule, setDayRule] = useState<PaymentDayRule>(income.paymentDayRule ?? "specific_day");
  const [hoursInput, setHoursInput] = useState<string>(income.hoursPerWeek?.toString() ?? "");

  const initialDisplayAmount = denormalizeIncomeAmount(Number(income.amount) || 0, initialBasis);
  const [amountInput, setAmountInput] = useState<string>(initialDisplayAmount.toString());
  const monthlyPreview = (() => {
    if (!editing) return null;
    const parsedAmount = Number(amountInput);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;
    const parsedHours = Number(hoursInput);
    const hours = basis === "hourly" ? (parsedHours > 0 ? parsedHours : defaultHoursGuess) : undefined;
    return previewNetMonthly({
      basis,
      type: incomeTypeFromBasis(basis),
      amount: parsedAmount,
      hoursPerWeek: hours,
    });
  })();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const rawAmount = Number(formData.get("amount"));
    const hoursPerWeek = Number(formData.get("hoursPerWeek"));
    const hours = basis === "hourly" ? (hoursPerWeek > 0 ? hoursPerWeek : defaultHoursGuess) : null;
    const safeName = formData.get("name");
    if (!safeName || !rawAmount || rawAmount <= 0) {
      setError("Please add a name and a valid amount.");
      setLoading(false);
      return;
    }

    const payload = {
      name: safeName,
      type: incomeTypeFromBasis(basis),
      amount: rawAmount,
      hoursPerWeek: hours,
      category: formData.get("category") as IncomeCategory,
      frequency: basis === "uc" ? "monthly" : (formData.get("frequency") as PaymentFrequency),
      paymentDayRule: formData.get("paymentDayRule") as PaymentDayRule,
      paymentDay: Number(formData.get("paymentDay")) || null,
      amountBasis: basis,
    };

    const res = await fetch(`/api/incomes/${income.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update income.");
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
    <form action={onSubmit} className="space-y-2">
      <Input name="name" defaultValue={income.name} required disabled={loading} />

        <Select name="category" defaultValue={income.category ?? "wage"} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wage">Wage / salary</SelectItem>
          <SelectItem value="benefit">Benefit</SelectItem>
          <SelectItem value="uc">Universal Credit</SelectItem>
          <SelectItem value="disability_pension">Disability/Pension</SelectItem>
          <SelectItem value="side_gig">Side project / self-employment</SelectItem>
          <SelectItem value="second_job">Second job</SelectItem>
          <SelectItem value="other">Other (untaxed)</SelectItem>
        </SelectContent>
      </Select>

      <Input
        name="amount"
        type="number"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        min={0.01}
        step="0.01"
        required
        disabled={loading}
      />

      <Select
        name="amountBasis"
        defaultValue={basis}
        disabled={loading}
        onValueChange={(v) => {
          const next = v as IncomeBasis;
          setBasis(next);
          if (next === "weekly_net") setFrequency("weekly");
          else if (next === "fortnightly_net") setFrequency("fortnightly");
          else if (next === "four_weekly_net") setFrequency("four_weekly");
          else setFrequency("monthly");
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {basisOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {basis === "hourly" && (
      <Input
        name="hoursPerWeek"
        type="number"
        value={hoursInput}
        onChange={(e) => setHoursInput(e.target.value)}
        placeholder={`Hours per week (defaults to ${defaultHoursGuess} if blank)`}
        min={0.1}
        step="0.25"
        disabled={loading}
      />
      )}

      <div className="space-y-2">
        <Select
          name="frequency"
          defaultValue={basis === "uc" ? "monthly" : frequency}
          disabled={loading || basis === "uc"}
          onValueChange={(v) => setFrequency(v as PaymentFrequency)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {frequencyOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {frequency === "weekly" ? (
          <>
            <input type="hidden" name="paymentDayRule" value="specific_day" />
            <Select
              name="paymentDay"
              defaultValue={(income.paymentDay ?? 1).toString()}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
                <SelectItem value="7">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </>
        ) : (
          <div className="grid gap-2 sm:grid-cols-[1.1fr,0.9fr]">
            <Select
              name="paymentDayRule"
              defaultValue={income.paymentDayRule ?? "specific_day"}
              disabled={loading}
              onValueChange={(v) => setDayRule(v as PaymentDayRule)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific_day">Specific calendar day</SelectItem>
                <SelectItem value="last_working_day">Last working day</SelectItem>
                <SelectItem value="last_friday">Last Friday</SelectItem>
                <SelectItem value="last_thursday">Last Thursday</SelectItem>
              </SelectContent>
            </Select>

            {dayRule === "specific_day" ? (
              <Input
                name="paymentDay"
                type="number"
                defaultValue={income.paymentDay ?? undefined}
                min={1}
                max={31}
                placeholder="Day (1-31)"
                disabled={loading}
              />
            ) : (
              <input type="hidden" name="paymentDay" value="" />
            )}
          </div>
        )}
      </div>

      {monthlyPreview !== null && (
        <p className="text-xs text-muted-foreground">
          Monthly equivalent (estimated): <span className="font-semibold text-foreground">{formatCurrency(monthlyPreview)}</span>
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
