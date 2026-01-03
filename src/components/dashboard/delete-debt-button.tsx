"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  debtId: number;
};

export function DeleteDebtButton({ debtId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const res = await fetch(`/api/debts/${debtId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (res.ok) {
      router.refresh();
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        Remove
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Removing..." : "Confirm"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
