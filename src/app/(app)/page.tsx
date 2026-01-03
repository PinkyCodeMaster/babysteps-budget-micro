import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Clock3, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const featureCards = [
  {
    title: "Debt clarity",
    body: "Snowball order stays sorted with remaining, minimum, and total progress visible in one calm view.",
    icon: Sparkles,
  },
  {
    title: "Cashflow guardrails",
    body: "Income, essentials, and U/C estimates roll up so you always know what is safe to put toward debt.",
    icon: Wallet,
  },
  {
    title: "Safe payments",
    body: "Overpayment checks plus inline edit and delete keep mistakes out of your payoff rhythm.",
    icon: ShieldCheck,
  },
  {
    title: "Progress you can feel",
    body: "Dark and light themes, empty states with guidance, and totals that update the moment you act.",
    icon: BarChart3,
  },
];

const steps = [
  {
    title: "Frame your plan",
    body: "Add debts with balances and minimums. We handle the snowball order and totals.",
    time: "5 minutes",
  },
  {
    title: "Get your monthly picture",
    body: "Log income, essential spend, and U/C so the app shows your safe-to-use cash each month.",
    time: "3 minutes",
  },
  {
    title: "Pay with confidence",
    body: "Hit the next target, stay within guardrails, and watch your remaining drop in real time.",
    time: "Weekly",
  },
];

const assurances = [
  "No bank connections or ads - just your numbers.",
  "Mobile-first screens with crisp dark mode.",
  "Server-side validation and sane copy everywhere.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto flex flex-col gap-16 px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Fresh palette, calmer layout
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              A calmer way to clear debt and stay funded.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              BabySteps keeps your snowball, income, and expenses in one focused view. The next move is obvious,
              guardrails are built-in, and both themes feel intentional.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {assurances.map((item) => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="border border-border/60 bg-card/80 shadow-xl shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Today</CardTitle>
                <Badge variant="outline" className="text-[11px]">Live preview</Badge>
              </div>
              <p className="text-sm text-muted-foreground">How the dashboard keeps you moving.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Next target</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">Travel Visa</p>
                    <p className="text-sm text-muted-foreground">Minimum $75 - $3,200 remaining</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">$486</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-border/70">
                  <div className="h-full w-[62%] rounded-full bg-primary/80" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Available to snowball", value: "$1,240" },
                  { label: "Paid this month", value: "$980" },
                  { label: "Timeline", value: "8.5 months" },
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
                  Overpayments are blocked, edit and delete live inline, and the next target is pinned to the top.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section id="how-it-works" className="grid gap-8 lg:grid-cols-[1fr,0.95fr] lg:items-start">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Stay in motion</CardTitle>
              <p className="text-sm text-muted-foreground">
                Light and dark get equal care. Inputs, charts, and cards use the same calm palette so every state feels
                intentional.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">Guided empty states</span>
              </div>
              <p className="pl-6">
                New users see exactly what to add first, with inline copy that works in both themes.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Cleaner typography</span>
              </div>
              <p className="pl-6">
                Geist pairs with softer cards and borders for better legibility and contrast across the app.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                <span className="font-medium">Fast paths to action</span>
              </div>
              <p className="pl-6">
                Sign up, sign in, and legal pages now share the same layout rhythm and spacing.
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

        <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Built for real life budgeting</CardTitle>
                <Badge variant="outline" className="text-[11px]">No gimmicks</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>Manual by design so you stay in control. No scraping, no ads, just the math you trust.</p>
              <p>Dark and light palettes share the same contrast ratios, so content stays readable everywhere.</p>
              <p className="font-medium text-foreground">
                When you are ready, the dashboard keeps its current layout - only the colors and support pages get the refresh.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-primary/10 shadow-md shadow-primary/20 backdrop-blur">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Start now</p>
                <p className="text-2xl font-semibold text-foreground">Get a calmer budgeting workspace in minutes.</p>
                <p className="text-sm text-muted-foreground">
                  Create an account, add your numbers, and let the app keep your snowball on track.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:w-44">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/techstack">
                  <Button variant="outline" className="w-full">
                    View the stack
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
