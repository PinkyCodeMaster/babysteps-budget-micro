"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const STORAGE_KEY = "babysteps-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(
    () => (typeof window !== "undefined" ? !localStorage.getItem(STORAGE_KEY) : false)
  );

  function accept() {
    localStorage.setItem(STORAGE_KEY, "yes");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <Card className="mx-auto flex max-w-3xl flex-col gap-3 border shadow-lg bg-background/95 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">We use cookies for a better experience.</p>
          <p>
            We only store the essentials to keep you signed in. Read our{" "}
            <Link href="/terms" className="text-primary underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary underline">
              privacy policy
            </Link>{" "}
            plus our{" "}
            <Link href="/cookies" className="text-primary underline">
              cookies notice
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={accept}>
            Got it
          </Button>
        </div>
      </Card>
    </div>
  );
}
