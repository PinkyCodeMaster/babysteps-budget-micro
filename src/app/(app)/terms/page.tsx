import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCheck, Globe, Gavel, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BabySteps",
};

const terms = [
  {
    title: "Accounts and eligibility",
    icon: BookCheck,
    body: "Use BabySteps for personal or household budgeting if you are able to enter your own data. You are responsible for keeping your login safe and for the accuracy of the numbers you add.",
  },
  {
    title: "Fair use",
    icon: ShieldCheck,
    body: "Do not use the service for unlawful purposes, spam, or automated scraping. The app is manual by design and should not be used to store payment card numbers or bank credentials.",
  },
  {
    title: "Data and privacy",
    icon: LockKeyhole,
    body: "We store the data you enter (debts, payments, income, expenses) along with account details and session cookies. We do not sell your data. See the privacy policy for full details.",
  },
  {
    title: "Availability",
    icon: Globe,
    body: "We aim for high uptime but do not promise uninterrupted access. Keep your own copies of critical information and request exports if you need them.",
  },
  {
    title: "Advice and liability",
    icon: Gavel,
    body: "BabySteps is a tracking tool, not financial advice. You make your own financial decisions and accept that we are not liable for losses arising from use of the service.",
  },
  {
    title: "Changes",
    icon: RefreshCw,
    body: "We may update these terms as the product evolves. Continued use of the app means you accept the latest version.",
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
            Welcome to BabySteps. By using this app you agree to these terms so we can serve you responsibly.
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
            <p>Questions about these terms? Email us at support@babysteps.app.</p>
            <p className="text-foreground">
              We will note any material changes here and update the effective date when this page is revised.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
