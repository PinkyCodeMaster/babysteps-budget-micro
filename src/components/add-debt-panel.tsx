"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddDebtForm } from "@/components/add-debt-form";

// Client wrapper to hide the add form until the user opts in.
export function AddDebtPanel() {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} size="lg">
        Add a debt
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <AddDebtForm />
      <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </div>
  );
}
