import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CloudRain,
  Flag,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const heroHighlights = [
  {
    label: "Method",
    value: "Debt snowball",
    helper: "Ramsey-inspired, fully manual control.",
  },
  {
    label: "Built for",
    value: "UK wages + UC",
    helper: "Multi-payday, taper-aware guardrails.",
  },
  {
    label: "Privacy",
    value: "No bank links",
    helper: "Data lives in Postgres you control.",
  },
];

const featureCards = [
  {
    title: "Snowball autopilot",
    body: "Smallest balances stay at the top with live remaining, so you always see the next target to clear.",
    icon: Target,
  },
  {
    title: "Cash guardrails",
    body: "Income, UC, rent, council tax, and essentials roll into a safe-to-snowball amount that updates as you log payments.",
    icon: Wallet,
  },
  {
    title: "Payment safety",
    body: "Server-side validation blocks overpayments, and inline edits keep your history tidy when plans change.",
    icon: ShieldCheck,
  },
  {
    title: "Calm to use",
    body: "Accessible typography, thoughtful empty states, and equal care for light and dark themes keep the app welcoming.",
    icon: Sparkles,
  },
];

const steps = [
  {
    title: "List debts and essentials",
    body: "Add balances, minimums, and due dates. Flag arrears so priority items stay ahead of cards and loans.",
    time: "5 minutes",
  },
  {
    title: "Plan your month",
    body: "Log wages, UC, and essentials to see what is safe to snowball after housing and core bills are covered.",
    time: "Weekly check-in",
  },
  {
    title: "Pay in order, stay funded",
    body: "We pin the next target, protect you from overpaying, and show progress the moment you record a payment.",
    time: "Each payment",
  },
];

const ukReadiness = [
  {
    title: "UC and variable pay friendly",
    body: "Handle UC tapering, mixed pay frequencies, and short months without losing track of your buffer.",
    icon: Wallet,
  },
  {
    title: "Priority debts protected",
    body: "Rent, council tax, and arrears sit ahead of everything else so your snowball never starves essentials.",
    icon: Flag,
  },
  {
    title: "Evidence-ready records",
    body: "Clear labels and export-ready data make it simple to prove payments or share summaries when needed.",
    icon: CheckCircle2,
  },
  {
    title: "No scraping or ads",
    body: "Manual by design - no bank connections, no trackers. Just your numbers and the math you choose to share.",
    icon: ShieldCheck,
  },
];

const trust = [
  {
    title: "Production stack",
    body: "Next.js 16 with TypeScript, shadcn/ui, Drizzle ORM, and Neon Postgres keep reads and writes fast and reliable.",
    icon: Sparkles,
  },
  {
    title: "Email and notifications",
    body: "React Email templates with Mailpit in development and Resend in production so messages land where they should.",
    icon: MailCheck,
  },
  {
    title: "Storage and observability",
    body: "S3-compatible storage via MinIO for exports and receipts, plus Sentry instrumentation out of the box.",
    icon: CloudRain,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto flex flex-col gap-16 px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              Built for UK households using the debt snowball
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Pay off debt faster without giving up control.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              BabySteps keeps the Ramsey-style snowball tidy for UK wages and UC. No bank connections, no ads - just a
              calm dashboard that shows what is safe to throw at debt while protecting rent and essentials.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="gap-2">
                  See how it works
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className="rounded-xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="text-base font-semibold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border border-border/60 bg-card/85 shadow-xl shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Snowball queue</CardTitle>
                <Badge variant="outline" className="text-[11px]">
                  Live math
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Next target, safe cash to use, and guardrails in one view.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Next target</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">Council tax arrears</p>
                    <p className="text-sm text-muted-foreground">Minimum GBP 80 - GBP 1,240 remaining</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">GBP 260</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-border/70">
                  <div className="h-full w-[58%] rounded-full bg-primary/80" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Safe to snowball", value: "GBP 1,120" },
                  { label: "Paid this month", value: "GBP 940" },
                  { label: "Estimated timeline", value: "7.5 months" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm shadow-sm"
                  >
                    <p className="text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Guardrails on every payment
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Overpayments are blocked, inline edits keep history honest, and the next target stays pinned so you
                  never guess where to send the next pound.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Why BabySteps
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built to ship, not just to demo</h2>
            <p className="max-w-3xl text-muted-foreground">
              The product keeps your plan honest and calm: no marketing fluff, just safeguards and clear math tuned for
              UK households.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border border-border/60 bg-card/70 shadow-sm shadow-primary/5 backdrop-blur"
                >
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">{feature.body}</CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="grid gap-8 lg:grid-cols-[1fr,0.95fr] lg:items-start">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">How the snowball runs here</CardTitle>
              <p className="text-sm text-muted-foreground">
                The product uses the classic method - smallest to largest - while protecting essentials and priority
                debts first.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">Guided from step one</span>
              </div>
              <p className="pl-6">
                Empty states explain what to add next, and we match tone across light and dark for readability.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Server-first validation</span>
              </div>
              <p className="pl-6">
                Payments, balances, and UC taper inputs are checked on the server to keep data consistent.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                <span className="font-medium">Fast to keep up</span>
              </div>
              <p className="pl-6">
                Auth, dashboards, and legal pages share the same spacing rhythm so you spend less time thinking about
                navigation.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm shadow-primary/5 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {`0${index + 1}`}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{step.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              UK realities, not hypotheticals
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built around real UK obligations</h2>
            <p className="max-w-3xl text-muted-foreground">
              From UC tapering to council tax and arrears, the app is tuned for the bills that come first in the UK.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ukReadiness.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="border border-border/60 bg-card/70 shadow-sm shadow-primary/5 backdrop-blur"
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
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-center" id="trust">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Ready for production use</CardTitle>
                <Badge variant="outline" className="text-[11px]">
                  No shortcuts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>Manual-first by choice so you stay in control. No scraping, no ads, just the math you trust.</p>
              <p>Light and dark palettes share contrast ratios, so content stays readable everywhere.</p>
              <p className="font-medium text-foreground">
                The dashboard stays focused on action: debts, payments, and cashflow with guardrails on every update.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-primary/10 shadow-md shadow-primary/20 backdrop-blur">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Start now</p>
                <p className="text-2xl font-semibold text-foreground">Get a production-ready snowball workspace.</p>
                <p className="text-sm text-muted-foreground">
                  Create an account, add your numbers, and let the app keep your plan on the rails.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:w-44">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="w-full">
                    See how we build
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {trust.map((item) => {
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
      </div>
    </main>
  );
}
