"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type Props = {
  initialEmail?: string;
};

export function VerifyEmailForm({ initialEmail }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [autoTriggered, setAutoTriggered] = React.useState(false);

  React.useEffect(() => {
    if (!initialEmail || autoTriggered) return;

    setError(null);
    setMessage(null);
    setAutoTriggered(true);

    authClient.sendVerificationEmail(
      { email: initialEmail, callbackURL: "/dashboard" },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          setMessage("Check your inbox for a verification link.");
        },
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message);
        },
      }
    );
  }, [initialEmail, autoTriggered]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        setError(null);
        setMessage(null);

        authClient.sendVerificationEmail(
          { email, callbackURL: "/dashboard" },
          {
            onRequest: () => setLoading(true),
            onSuccess: () => {
              setLoading(false);
              setMessage("Check your inbox for a verification link.");
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
          <h1 className="text-xl font-semibold">Verify your email</h1>
          <FieldDescription>We&apos;ll send you a fresh link to confirm your address.</FieldDescription>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={loading}
            defaultValue={initialEmail}
          />
        </Field>

        <FieldDescription className="text-sm text-muted-foreground">
          Seeing &quot;Email not verified&quot; on sign-in? Enter your email here to resend the link, then sign in again after verifying.
        </FieldDescription>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send verification link"}
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
