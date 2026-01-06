"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  defaultHoursGuess,
  incomeTypeFromBasis,
  previewNetMonthly,
  type IncomeBasis,
  type IncomeCategory,
  type PaymentDayRule,
  type PaymentFrequency,
} from "@/lib/income-logic";
import { formatCurrency } from "@/lib/format";

const basisOptions: { value: IncomeBasis; label: string }[] = [
  { value: "monthly_net", label: "Monthly take-home" },
  { value: "weekly_net", label: "Weekly take-home" },
  { value: "fortnightly_net", label: "Fortnightly take-home" },
  { value: "four_weekly_net", label: "Four-weekly take-home" },
  { value: "yearly_gross", label: "Yearly gross (before tax)" },
  { value: "hourly", label: "Hourly (gross)" },
  { value: "uc", label: "Universal Credit (net)" },
];

const frequencyOptions: { value: PaymentFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Bi-weekly" },
  { value: "four_weekly", label: "Four-weekly" },
  { value: "monthly", label: "Monthly" },
];

export function AddIncomeForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<IncomeCategory | "">("");
  const [basis, setBasis] = useState<IncomeBasis>("monthly_net");
  const [frequency, setFrequency] = useState<PaymentFrequency>("monthly");
  const [dayRule, setDayRule] = useState<PaymentDayRule>("specific_day");
  const [amountInput, setAmountInput] = useState<string>("");
  const [hoursInput, setHoursInput] = useState<string>("");

  const monthlyPreview = (() => {
    const parsedAmount = Number(amountInput);
    const parsedHours = Number(hoursInput);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;
    const hours = basis === "hourly" ? (parsedHours > 0 ? parsedHours : defaultHoursGuess) : undefined;
    const type = incomeTypeFromBasis(basis);
    return previewNetMonthly({
      basis,
      type,
      amount: parsedAmount,
      hoursPerWeek: hours,
    });
  })();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const rawAmount = Number(formData.get("amount"));
    const hoursPerWeek = Number(formData.get("hoursPerWeek"));
    const hours = basis === "hourly" ? (hoursPerWeek > 0 ? hoursPerWeek : defaultHoursGuess) : undefined;
    const paymentDayRaw = Number(formData.get("paymentDay"));
    const paymentDay = Number.isFinite(paymentDayRaw) ? paymentDayRaw : undefined;
    const paymentDayRule = formData.get("paymentDayRule") as PaymentDayRule;
    const categoryValue = formData.get("category") as IncomeCategory;
    const frequencyValue = formData.get("frequency") as PaymentFrequency;

    if (!formData.get("name") || !categoryValue || !rawAmount || rawAmount <= 0) {
      setError("Please provide a category, name, and amount.");
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.get("name"),
      type: incomeTypeFromBasis(basis),
      amount: rawAmount,
      hoursPerWeek: hours,
      category: categoryValue,
      frequency: basis === "uc" ? "monthly" : frequencyValue,
      paymentDayRule,
      paymentDay,
      amountBasis: basis,
    };

    const res = await fetch("/api/incomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Please check the income details and try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    (formRef.current as HTMLFormElement | null)?.reset();
    setCategory("");
    setBasis("monthly_net");
    setFrequency("monthly");
    setDayRule("specific_day");
    setAmountInput("");
    setHoursInput("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Income</CardTitle>
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
          <Select
            name="category"
            required
            disabled={loading}
            value={category}
            onValueChange={(v) => setCategory(v as IncomeCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Income category (wage, benefit, UC, etc.)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wage">Wage / salary</SelectItem>
              <SelectItem value="benefit">Benefit (non-taxable)</SelectItem>
              <SelectItem value="uc">Universal Credit</SelectItem>
              <SelectItem value="disability_pension">Disability / pension</SelectItem>
              <SelectItem value="side_gig">Side project / self-employment</SelectItem>
              <SelectItem value="second_job">Second job</SelectItem>
              <SelectItem value="other">Other (untaxed)</SelectItem>
            </SelectContent>
          </Select>

          <Input name="name" placeholder="Income name (e.g. Salary, Child Benefit)" required disabled={loading} />

          <div className="grid gap-2 sm:grid-cols-[1fr,1fr]">
            <Input
              name="amount"
              type="number"
              placeholder={
                basis === "hourly"
                  ? "Hourly rate (gross)"
                  : basis === "yearly_gross"
                    ? "Yearly salary (gross)"
                    : basis === "weekly_net"
                      ? "Weekly take-home"
                      : basis === "fortnightly_net"
                        ? "Bi-weekly take-home"
                        : basis === "four_weekly_net"
                          ? "Four-weekly take-home"
                          : basis === "uc"
                            ? "UC monthly award"
                            : "Monthly take-home"
              }
              required
              min={0.01}
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              disabled={loading}
            />
            <Select
              name="amountBasis"
              required
              disabled={loading}
              value={basis}
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
                <SelectValue placeholder="Amount is for..." />
              </SelectTrigger>
              <SelectContent>
                {basisOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {basis === "hourly" && (
            <div className="space-y-2">
              <Input
                name="hoursPerWeek"
                type="number"
                placeholder={`Hours per week (defaults to ${defaultHoursGuess} if unknown)`}
                min={0.25}
                step="0.25"
                disabled={loading}
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Not sure? We will assume {defaultHoursGuess} hours/week and you can tweak later.
              </p>
            </div>
          )}

          {(basis === "yearly_gross" || basis === "weekly_net" || basis === "fortnightly_net" || basis === "four_weekly_net") && (
            <p className="text-xs text-muted-foreground">
              We convert this to a monthly amount using the standard 1257L tax code for now.
            </p>
          )}

          {monthlyPreview !== null && (
            <p className="text-xs text-foreground">
              Monthly equivalent: <span className="font-semibold">{formatCurrency(monthlyPreview)}</span> (auto-calculated)
            </p>
          )}

          <div className="space-y-2">
            <Select
              name="frequency"
              required
              disabled={loading || basis === "uc"}
              value={basis === "uc" ? "monthly" : frequency}
              onValueChange={(v) => setFrequency(v as PaymentFrequency)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pay cycle" />
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
                <Select name="paymentDay" disabled={loading} defaultValue="1">
                  <SelectTrigger>
                    <SelectValue placeholder="Day of week (optional)" />
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
                  disabled={loading}
                  value={dayRule}
                  onValueChange={(v) => setDayRule(v as PaymentDayRule)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment timing (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="specific_day">Specific calendar day</SelectItem>
                    <SelectItem value="last_working_day">Last working day of the month</SelectItem>
                    <SelectItem value="last_friday">Last Friday of the month</SelectItem>
                    <SelectItem value="last_thursday">Last Thursday of the month</SelectItem>
                  </SelectContent>
                </Select>

                {dayRule === "specific_day" && (
                  <Input
                    name="paymentDay"
                    type="number"
                    placeholder="Day (1-31, optional)"
                    min={1}
                    max={31}
                    disabled={loading}
                  />
                )}
                {dayRule !== "specific_day" && <input type="hidden" name="paymentDay" value="" />}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
