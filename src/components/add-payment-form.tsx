"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

type Props = {
  debtId: number;
  remainingBalance: number;
};

export function AddPaymentForm({
  debtId,
  remainingBalance,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    // Payments are validated on the API (including overpayment guard).
    setLoading(true);
    setError(null);

    const amount = Number(formData.get("amount"));

    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/debts/${debtId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        data.error || "We couldn't add that payment. Please try again."
      );
      setLoading(false);
      return;
    }

    // Refresh server data to reflect the new payment state.
    setLoading(false);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-2">
      <Input
        name="amount"
        type="number"
        placeholder={`Payment (max ${formatCurrency(remainingBalance)})`}
        min={1}
        max={remainingBalance}
        className="w-40"
        required
        disabled={loading}
      />

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Saving..." : "Pay"}
      </Button>

      {remainingBalance <= 50 && remainingBalance > 0 && (
        <span className="text-xs text-muted-foreground" aria-live="polite">
          Almost there 🎉
        </span>
      )}

      {error && (
        <span className="text-xs text-red-500" aria-live="polite">
          {error}
        </span>
      )}
    </form>
  );
}
