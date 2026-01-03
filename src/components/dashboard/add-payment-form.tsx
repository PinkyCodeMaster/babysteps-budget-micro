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

export function AddPaymentForm({ debtId, remainingBalance }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    // Payments are validated on the API (including overpayment guard).
    setLoading(true);
    setError(null);

    const amount = Number(formData.get("amount"));

    if (!amount || amount <= 0) {
      setError("Enter a payment amount to log");
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
      setError(data.error || "We could not add that payment just yet. Please try again.");
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
        placeholder={`Payment amount (up to ${formatCurrency(remainingBalance)})`}
        min={1}
        max={remainingBalance}
        className="w-48"
        required
        disabled={loading}
      />

      <Button type="submit" size="sm" disabled={loading} className="w-fit">
        {loading ? "Saving..." : "Log payment"}
      </Button>

      {remainingBalance <= 50 && remainingBalance > 0 && (
        <span className="text-xs text-muted-foreground" aria-live="polite">
          Almost there - you are close to clearing this one.
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
