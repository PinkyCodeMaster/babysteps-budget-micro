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
  | "other";

type Props = {
  expense: {
    id: number;
    name: string;
    type: ExpenseType;
    amount: number;
  };
};

export function EditExpenseForm({ expense }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      type: formData.get("type") as ExpenseType,
      amount: Number(formData.get("amount")),
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

      <Input
        name="amount"
        type="number"
        defaultValue={expense.amount}
        min={1}
        required
        disabled={loading}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save"}
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
