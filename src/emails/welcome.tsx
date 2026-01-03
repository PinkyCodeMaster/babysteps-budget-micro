import { Button, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";

type WelcomeEmailProps = {
  dashboardUrl?: string;
};

export function WelcomeEmail({ dashboardUrl = "https://localhost:3000/dashboard" }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to BabySteps">
      <Text className="text-base text-slate-900">Welcome to BabySteps!</Text>
      <Text className="text-sm text-slate-700">
        Your email is verified and you&apos;re all set to start tracking debts, recording payments,
        and following your snowball plan. If you ever need help, reply to this email.
      </Text>
      <Button
        href={dashboardUrl}
        className="rounded bg-slate-900 px-4 py-2 text-white no-underline"
      >
        Go to dashboard
      </Button>
    </EmailLayout>
  );
}

export default WelcomeEmail;
