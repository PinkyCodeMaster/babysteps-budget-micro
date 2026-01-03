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

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      type: formData.get("type") as ExpenseType,
      amount: Number(formData.get("amount")),
      category: formData.get("category") as ExpenseCategory,
      frequency: formData.get("frequency") as ExpenseFrequency,
      paymentDay: Number(formData.get("paymentDay")) || null,
      paidByUc: formData.get("paidByUc") === "on",
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
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setEditing(true)}
      >
        Edit
      </Button>
    );
  }

  return (
    <form action={onSubmit} className="space-y-2">
      <Input
        name="name"
        defaultValue={expense.name}
        required
        disabled={loading}
      />

      <Select
        name="type"
        defaultValue={expense.type}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue />
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
        </SelectContent>
      </Select>

      <Select name="category" defaultValue={expense.category ?? "other"} disabled={loading}>
        <SelectTrigger>
          <SelectValue />
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
        defaultValue={expense.amount}
        min={1}
        required
        disabled={loading}
      />

      <Select name="frequency" defaultValue={expense.frequency ?? "monthly"} disabled={loading}>
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
          checked={paidByUc}
          onCheckedChange={(checked) => setPaidByUc(Boolean(checked))}
          disabled={loading}
        />
        <label htmlFor={`paidByUc-${expense.id}`} className="text-sm text-foreground">
          Paid by UC
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

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
