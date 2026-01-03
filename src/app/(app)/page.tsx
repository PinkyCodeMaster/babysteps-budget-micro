import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  "Track every debt with clear balances and minimums.",
  "Add payments safely – overpayments are blocked server-side.",
  "See snowball order so you always know the next target.",
  "Simple, welcoming states for first-time users.",
];

const reassurance = [
  "No bank connections or account setup needed.",
  "Your numbers stay server-side; no duplicate calculations.",
  "Built for clarity: light/dark modes, friendly copy, fast loads.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto flex flex-col gap-12 px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Debt payoff made calm
            </div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Stay on top of every debt with a focused dashboard.
            </h1>
            <p className="text-lg text-muted-foreground">
              BabySteps keeps the essentials: add debts, record payments, and follow the
              snowball order. No distractions, just progress.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg">Open dashboard</Button>
              </Link>
              <Link href="/techstack">
                <Button variant="outline" size="lg">
                  See how it’s built
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((item) => (
                <Card key={item} className="border-dashed bg-white/60 dark:bg-slate-900/60">
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    {item}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-xl">What you’ll see</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground text-sm">
              <p>Totals for debt and paid-to-date, with percentage progress.</p>
              <p>Per-debt remaining balances with inline pay/edit/delete actions.</p>
              <p>Empty states that guide you instead of leaving a blank screen.</p>
              <p>Light/dark modes built-in.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Built for humans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {reassurance.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Fast to start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Add debts with balances and minimums.</li>
                <li>Record payments as you make them.</li>
                <li>Follow the snowball order; we sort it for you.</li>
              </ol>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Ready for growth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>API-first, with server-side validation.</p>
              <p>Clear layering for future auth and user accounts.</p>
              <p>Drizzle + Neon for reliable data.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
