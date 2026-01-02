"use client";

import { useRef, useState } from "react";
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

export function AddDebtForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    // Post to the debts API; all validation lives server-side.
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      type: formData.get("type"),
      balance: Number(formData.get("balance")),
      interestRate: Number(formData.get("interestRate")) || 0,
      minimumPayment: Number(formData.get("minimumPayment")),
    };

    const res = await fetch("/api/debts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        data.error || "Please check the debt details and try again."
      );
      setLoading(false);
      return;
    }

    // Optimistic UX: clear the form, then refresh server data.
    (formRef.current as HTMLFormElement | null)?.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Debt</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          action={onSubmit}
          ref={formRef}
          className="space-y-4"
        >
          <Input
            name="name"
            placeholder="Debt name (e.g. Visa Card)"
            required
            disabled={loading}
          />

          <Select name="type" required disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Debt type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">
                Credit Card
              </SelectItem>
              <SelectItem value="loan">
                Loan
              </SelectItem>
              <SelectItem value="ccj">
                CCJ
              </SelectItem>
            </SelectContent>
          </Select>

          <Input
            name="balance"
            type="number"
            placeholder="Starting balance"
            required
            min={1}
            disabled={loading}
          />

          <Input
            name="interestRate"
            type="number"
            placeholder="Interest rate (%)"
            disabled={loading}
          />

          <Input
            name="minimumPayment"
            type="number"
            placeholder="Minimum payment"
            required
            min={1}
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-red-500" aria-live="polite">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Debt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
