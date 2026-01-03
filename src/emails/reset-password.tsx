import { Button, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";

type ResetPasswordEmailProps = {
  resetUrl: string;
};

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your BabySteps password">
      <Text className="text-base text-slate-900">
        You requested to reset your password. Click the button below to set a new one.
      </Text>
      <Button
        href={resetUrl}
        className="rounded bg-slate-900 px-4 py-2 text-white no-underline"
      >
        Reset password
      </Button>
      <Text className="text-sm text-slate-600">
        If the button doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <a href={resetUrl} className="text-slate-900 underline">
          {resetUrl}
        </a>
      </Text>
    </EmailLayout>
  );
}

export default ResetPasswordEmail;
