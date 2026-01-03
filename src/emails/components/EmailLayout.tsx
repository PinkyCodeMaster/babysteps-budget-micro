import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

type EmailLayoutProps = {
  preview: string;
  children: React.ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans text-slate-900">
          <Container className="mx-auto my-10 max-w-xl rounded border border-slate-200 bg-white p-6">
            <Section className="mb-6">
              <Text className="text-lg font-semibold text-slate-900">BabySteps</Text>
              <Text className="text-sm text-slate-500">
                Track debts, record payments, and see progress clearly.
              </Text>
            </Section>
            <Section className="space-y-4">{children}</Section>
            <Section className="mt-8 border-t border-slate-200 pt-4">
              <Text className="text-xs text-slate-500">
                This email was sent by BabySteps. If you didn&apos;t request it, you can safely ignore it.
              </Text>
              <Link href="https://localhost:3000" className="text-xs text-slate-500 underline">
                Visit BabySteps
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
