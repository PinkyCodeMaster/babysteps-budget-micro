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

type Props = {
  debt: {
    id: number;
    name: string;
    type: string;
    balance: number;
    interestRate: number | null;
    minimumPayment: number;
  };
};

export function EditDebtForm({ debt }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    // Inline edit uses the existing PUT route and revalidates on success.
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      type: formData.get("type"),
      balance: Number(formData.get("balance")),
      interestRate: Number(formData.get("interestRate")) || 0,
      minimumPayment: Number(formData.get("minimumPayment")),
    };

    const res = await fetch(`/api/debts/${debt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update debt");
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
        defaultValue={debt.name}
        required
      />

      <Select name="type" defaultValue={debt.type}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="credit_card">
            Credit Card
          </SelectItem>
          <SelectItem value="loan">Loan</SelectItem>
          <SelectItem value="ccj">CCJ</SelectItem>
        </SelectContent>
      </Select>

      <Input
        name="balance"
        type="number"
        defaultValue={debt.balance}
        min={1}
        required
      />

      <Input
        name="interestRate"
        type="number"
        defaultValue={debt.interestRate ?? 0}
      />

      <Input
        name="minimumPayment"
        type="number"
        defaultValue={debt.minimumPayment}
        min={1}
        required
      />

      {error && (
        <p className="text-sm text-red-500" aria-live="polite">{error}</p>
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
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
