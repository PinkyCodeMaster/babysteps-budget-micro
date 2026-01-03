import { Button, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";

type VerifyEmailProps = {
  verifyUrl: string;
};

export function VerifyEmailEmail({ verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verify your email for BabySteps">
      <Text className="text-base text-slate-900">
        Confirm your email to finish setting up your account.
      </Text>
      <Button
        href={verifyUrl}
        className="rounded bg-slate-900 px-4 py-2 text-white no-underline"
      >
        Verify email
      </Button>
      <Text className="text-sm text-slate-600">
        If the button doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <a href={verifyUrl} className="text-slate-900 underline">
          {verifyUrl}
        </a>
      </Text>
    </EmailLayout>
  );
}

export default VerifyEmailEmail;
