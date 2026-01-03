"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type ExpenseType =
  | "housing"
  | "utilities"
  | "transport"
  | "food"
  | "childcare"
  | "insurance"
  | "subscriptions"
  | "medical"
  | "education"
  | "entertainment"
  | "savings"
  | "other"
  | "rent"
  | "service_charge"
  | "council_tax"
  | "gas"
  | "electric"
  | "water"
  | "car_fuel"
  | "groceries"
  | "phone"
  | "internet";

type ExpenseCategory = ExpenseType;
type ExpenseFrequency = "weekly" | "fortnightly" | "four_weekly" | "monthly" | "quarterly" | "yearly";

export function AddExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidByUc, setPaidByUc] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      type: formData.get("type") as ExpenseType,
      amount: Number(formData.get("amount")),
      category: formData.get("category") as ExpenseCategory,
      frequency: formData.get("frequency") as ExpenseFrequency,
      paymentDay: Number(formData.get("paymentDay")) || undefined,
      paidByUc: formData.get("paidByUc") === "on",
    };

    if (!payload.name || !payload.type || !payload.amount || payload.amount <= 0) {
      setError("Please provide a name, type, and monthly amount.");
      setLoading(false);
      return;
    }

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
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Expense name (e.g. Rent)"
            required
            disabled={loading}
          />

          <Select
            name="type"
            required
            disabled={loading}
            defaultValue="housing"
          >
            <SelectTrigger>
              <SelectValue placeholder="Expense type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="childcare">Childcare</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="subscriptions">Subscriptions</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="service_charge">Service charge</SelectItem>
              <SelectItem value="council_tax">Council tax</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="car_fuel">Car fuel</SelectItem>
              <SelectItem value="groceries">Groceries</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
            </SelectContent>
          </Select>

          <Select name="category" required disabled={loading} defaultValue="other">
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="service_charge">Service charge</SelectItem>
              <SelectItem value="council_tax">Council tax</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="car_fuel">Car fuel</SelectItem>
              <SelectItem value="groceries">Groceries</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="childcare">Childcare</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="subscriptions">Subscriptions</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input
            name="amount"
            type="number"
            placeholder="Monthly amount"
            required
            min={1}
            disabled={loading}
          />

          <Select name="frequency" required disabled={loading} defaultValue="monthly">
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
              checked={paidByUc}
              onCheckedChange={(checked) => setPaidByUc(Boolean(checked))}
              disabled={loading}
            />
            <label htmlFor="paidByUc" className="text-sm text-foreground">
              Paid by UC
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
