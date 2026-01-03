import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Lock, Shield, Cookie, Clock3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BabySteps",
};

const sections = [
  {
    title: "What we collect",
    icon: ShieldCheck,
    body: "Account details (email, name) and the financial data you enter (debts, payments, income, expenses). We also store authentication and session cookies.",
  },
  {
    title: "How we use it",
    icon: Lock,
    body: "To run the app, keep you signed in, and show accurate totals. We do not sell or share your data with advertisers.",
  },
  {
    title: "Cookies",
    icon: Cookie,
    body: "We use essential cookies for sessions only. No tracking pixels or ad cookies.",
  },
  {
    title: "Data retention",
    icon: Clock3,
    body: "Your data stays until you remove it. Contact us if you need your account deleted.",
  },
  {
    title: "Security",
    icon: Shield,
    body: "We validate on the server and use industry-standard storage, but no system is 100% secure, so please use strong passwords.",
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
            We respect your privacy. This policy explains what we collect and how we use it.
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
            <p>Questions? Email us at privacy@babysteps.test.</p>
            <p className="text-foreground">
              We keep this policy simple on purpose. If we change how we use your data, we will update this page and let you
              know.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
