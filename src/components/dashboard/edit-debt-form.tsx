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
    minimumPayment: number | null;
    frequency?: string;
    dueDay?: number | null;
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
      balance: Math.round(Number(formData.get("balance")) * 100) / 100,
      interestRate: formData.get("interestRate")
        ? Math.round(Number(formData.get("interestRate")) * 100) / 100
        : null,
      minimumPayment: formData.get("minimumPayment")
        ? Math.round(Number(formData.get("minimumPayment")) * 100) / 100
        : null,
      frequency: formData.get("frequency"),
      dueDay: Number(formData.get("dueDay")) || null,
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
          <SelectItem value="personal_loan">Personal Loan</SelectItem>
          <SelectItem value="loan">Loan</SelectItem>
          <SelectItem value="mortgage">Mortgage</SelectItem>
          <SelectItem value="car_finance">Car Finance / HP</SelectItem>
          <SelectItem value="overdraft">Overdraft</SelectItem>
          <SelectItem value="payday">Payday</SelectItem>
          <SelectItem value="utility_arrears">Utility Arrears</SelectItem>
          <SelectItem value="council_tax">Council Tax</SelectItem>
          <SelectItem value="tax_arrears">Tax Arrears</SelectItem>
          <SelectItem value="student_loan">Student Loan</SelectItem>
          <SelectItem value="store_card">Store Card</SelectItem>
          <SelectItem value="hire_purchase">Hire Purchase</SelectItem>
          <SelectItem value="old_phone_bill">Old Phone Bill</SelectItem>
          <SelectItem value="rent_arrears">Rent Arrears</SelectItem>
          <SelectItem value="gas_arrears">Gas Arrears</SelectItem>
          <SelectItem value="electric_arrears">Electric Arrears</SelectItem>
          <SelectItem value="water_arrears">Water Arrears</SelectItem>
          <SelectItem value="income_tax_arrears">Income Tax Arrears</SelectItem>
          <SelectItem value="ccj">CCJ</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Input
        name="balance"
        type="number"
        defaultValue={debt.balance}
        min={0.01}
        step="0.01"
        required
      />

      <Input
        name="interestRate"
        type="number"
        defaultValue={debt.interestRate ?? undefined}
        min={0}
        step="0.01"
      />

      <Input
        name="minimumPayment"
        type="number"
        defaultValue={debt.minimumPayment ?? undefined}
        min={0.01}
        step="0.01"
      />

      <Select name="frequency" defaultValue={debt.frequency ?? "monthly"}>
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
        name="dueDay"
        type="number"
        defaultValue={debt.dueDay ?? undefined}
        min={1}
        max={31}
        placeholder="Due day (1-31, optional)"
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
