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
