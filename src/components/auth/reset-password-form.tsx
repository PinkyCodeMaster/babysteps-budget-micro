"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get("password") as string;
        const confirm = formData.get("confirm-password") as string;

        setError(null);
        setMessage(null);

        if (newPassword !== confirm) {
          setError("Passwords do not match");
          return;
        }

        authClient.resetPassword(
          { newPassword, token },
          {
            onRequest: () => setLoading(true),
            onSuccess: () => {
              setLoading(false);
              setMessage("Password updated. You can sign in now.");
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
          <h1 className="text-xl font-semibold">Reset password</h1>
          <FieldDescription>
            Enter a new password to finish resetting your account.
          </FieldDescription>
        </div>

        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input id="password" name="password" type="password" required disabled={loading} />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            disabled={loading}
          />
        </Field>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
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
