import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, ShieldCheck, Gavel, RefreshCw, Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BabySteps",
};

const terms = [
  {
    title: "Usage",
    icon: BookText,
    body: "BabySteps is provided as-is to help you track debts, payments, income, and expenses. Do not use it for unlawful purposes.",
  },
  {
    title: "Data",
    icon: ShieldCheck,
    body: "You are responsible for the accuracy of the numbers you enter. We store data securely and do not sell it.",
  },
  {
    title: "Availability",
    icon: Globe,
    body: "We aim for high uptime but do not guarantee uninterrupted access. Back up any critical data you need.",
  },
  {
    title: "Liability",
    icon: Gavel,
    body: "BabySteps does not provide financial advice. You remain responsible for your financial decisions.",
  },
  {
    title: "Changes",
    icon: RefreshCw,
    body: "We may update these terms; continued use means you accept the latest version.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Straightforward terms
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="max-w-2xl text-muted-foreground">
            Welcome to BabySteps. By using this app you agree to these terms. We keep them simple.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {terms.map((item) => {
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
          <CardContent className="space-y-2 p-6 text-sm leading-relaxed text-muted-foreground">
            <p>Questions? Email us at support@babysteps.test.</p>
            <p className="text-foreground">If anything changes, we will note it here and keep the language clear.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
