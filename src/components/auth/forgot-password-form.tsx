"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        setError(null);
        setMessage(null);

        authClient.requestPasswordReset(
          {
            email,
            redirectTo: "/reset-password",
          },
          {
            onRequest: () => setLoading(true),
            onSuccess: () => {
              setLoading(false);
              setMessage("Check your email for a reset link.");
            },
            onError: (ctx) => {
              setLoading(false);
              setError(ctx.error.message);
            },
          }
        );
      }}
    >
      <FieldGroup>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Forgot password</h1>
          <FieldDescription>
            Enter your email and we’ll send you a reset link.
          </FieldDescription>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required disabled={loading} />
        </Field>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending link..." : "Send reset link"}
          </Button>
        </Field>

        {message && (
          <p className="text-sm text-green-600" aria-live="polite">
            {message}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500" aria-live="polite">
            {error}
          </p>
        )}
      </FieldGroup>
    </form>
  );
}
