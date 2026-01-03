"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IncomeType = "hourly" | "monthly_net" | "yearly_gross" | "uc";
type IncomeCategory = "wage" | "benefit" | "uc" | "disability_pension" | "side_gig" | "second_job" | "other";
type PaymentFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

export function AddIncomeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<IncomeType>("hourly");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      type: formData.get("type") as IncomeType,
      amount: Number(formData.get("amount")),
      hoursPerWeek: Number(formData.get("hoursPerWeek")) || undefined,
      category: formData.get("category") as IncomeCategory,
      frequency: formData.get("frequency") as PaymentFrequency,
      paymentDay: Number(formData.get("paymentDay")) || undefined,
    };

    if (!payload.name || !payload.type || !payload.amount || payload.amount <= 0) {
      setError("Please provide a name, type, and amount.");
      setLoading(false);
      return;
    }

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
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Income</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Income name (e.g. Salary)"
            required
            disabled={loading}
          />

          <Select
            name="type"
            required
            disabled={loading}
            defaultValue="hourly"
            onValueChange={(v) => setType(v as IncomeType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Income type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly (gross)</SelectItem>
              <SelectItem value="monthly_net">Monthly (net)</SelectItem>
              <SelectItem value="yearly_gross">Yearly (gross)</SelectItem>
              <SelectItem value="uc">Universal Credit (net)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            name="category"
            required
            disabled={loading}
            defaultValue="wage"
          >
            <SelectTrigger>
              <SelectValue placeholder="Income category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wage">Wage / Salary</SelectItem>
              <SelectItem value="benefit">Benefit</SelectItem>
              <SelectItem value="uc">Universal Credit</SelectItem>
              <SelectItem value="disability_pension">Disability/Pension</SelectItem>
              <SelectItem value="side_gig">Side gig</SelectItem>
              <SelectItem value="second_job">Second job</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input
            name="amount"
            type="number"
            placeholder={
              type === "hourly"
                ? "Hourly rate"
                : type === "yearly_gross"
                ? "Yearly gross"
                : "Monthly net"
            }
            required
            min={1}
            disabled={loading}
          />

          <Select
            name="frequency"
            required
            disabled={loading}
            defaultValue="monthly"
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

          {type === "hourly" && (
            <Input
              name="hoursPerWeek"
              type="number"
              placeholder="Hours per week"
              min={1}
              disabled={loading}
            />
          )}

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
