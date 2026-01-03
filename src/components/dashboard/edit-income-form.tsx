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

type IncomeType = "hourly" | "monthly_net" | "yearly_gross" | "uc";

type Props = {
  income: {
    id: number;
    name: string;
    type: IncomeType;
    amount: number;
    hoursPerWeek: number | null;
  };
};

export function EditIncomeForm({ income }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<IncomeType>(income.type);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      type: formData.get("type") as IncomeType,
      amount: Number(formData.get("amount")),
      hoursPerWeek: Number(formData.get("hoursPerWeek")) || null,
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
        defaultValue={income.name}
        required
        disabled={loading}
      />

      <Select
        name="type"
        defaultValue={income.type}
        onValueChange={(v) => setType(v as IncomeType)}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue />
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
        defaultValue={income.amount}
        min={1}
        required
        disabled={loading}
      />

      {type === "hourly" && (
        <Input
          name="hoursPerWeek"
          type="number"
          defaultValue={income.hoursPerWeek ?? undefined}
          placeholder="Hours per week"
          min={1}
          disabled={loading}
        />
      )}

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
