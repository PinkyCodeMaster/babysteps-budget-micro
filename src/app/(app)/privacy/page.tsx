import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Lock, Shield, Cookie, Clock3, Server } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BabySteps",
};

const sections = [
  {
    title: "What we collect",
    icon: ShieldCheck,
    body: "Account details (email and name) plus the numbers you enter (debts, payments, income, expenses). Support emails you send us are kept so we can respond.",
  },
  {
    title: "How we use it",
    icon: Lock,
    body: "To run the app, keep you signed in, send account or support emails, and calculate your snowball totals. We do not sell your data or share it with advertisers.",
  },
  {
    title: "Cookies and storage",
    icon: Cookie,
    body: "We use essential cookies for sessions and local storage for theme and cookie consent. No marketing pixels. Data lives in Neon Postgres with optional S3-compatible backups.",
  },
  {
    title: "Third parties",
    icon: Server,
    body: "Email is delivered via Resend in production and Mailpit in development. Errors are monitored with Sentry. Files use S3-compatible storage such as MinIO.",
  },
  {
    title: "Data retention and deletion",
    icon: Clock3,
    body: "Your data stays until you remove it. Ask us for an export or deletion at any time and we will confirm via your account email.",
  },
  {
    title: "Security",
    icon: Shield,
    body: "Server-side validation protects against overpayments and bad data. No bank connections are used. Use strong passwords and keep your device secure.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Privacy first
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="max-w-2xl text-muted-foreground">
            We keep your data simple and private. This policy explains what we collect and how we use it.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border border-border/60 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur"
              >
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">{item.body}</CardContent>
              </Card>
            );
          })}
        </section>

        <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
          <CardContent className="space-y-3 p-6 text-sm leading-relaxed text-muted-foreground">
            <p>Questions or data requests? Email us at privacy@babysteps.app.</p>
            <p className="text-foreground">
              If we change how we use your data, we will update this page and the effective date.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
