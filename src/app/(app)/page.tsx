import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  "Add and manage debts with validation",
  "Record payments safely with overpayment protection",
  "Snowball ordering by remaining balance",
  "Clear progress and totals",
];

const designPrinciples = [
  "Finished over fancy - small scope, fully complete",
  "Derived data - balances come from payments",
  "Server-first - business logic lives in API routes",
  "Simple UX - clear states, no dead ends",
];

const stack = [
  "Next.js 16 (App Router) and TypeScript",
  "Drizzle ORM + Neon (Postgres)",
  "shadcn/ui + Tailwind CSS",
];

export default function HomePage() {
  return (
    <main className="min-h-screen ">
      <div className="container mx-auto flex flex-col gap-12 px-6 py-16">
        <Card className="border-0 shadow-sm backdrop-blur">
          <CardHeader className="space-y-3">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Portfolio-ready Next.js app
            </div>
            <CardTitle className="text-3xl font-bold">
              BabySteps - a focused debt snowball tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <p className="text-lg text-slate-700">
              Add debts, record payments, and watch your remaining balance drop.
              No accounts, no bank connections, no noise.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg">Go to dashboard</Button>
              </Link>
              <Link href="https://nextjs.org" target="_blank" rel="noreferrer">
                <Button variant="outline" size="lg">
                  View tech stack
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="h-full border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    What it does
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <ul className="list-disc space-y-2 pl-4">
                    {features.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="h-full border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Design principles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <ul className="list-disc space-y-2 pl-4">
                    {designPrinciples.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Core flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Add debts, record payments, and see progress update instantly.</p>
              <p>Balanced empty states keep first-time users on track.</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Technical stack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-4">
                {stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Scope guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>No auth, no bank integrations, no charts. Everything else is finished.</p>
              <p>Validation lives server-side to keep data safe.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              How to use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Open the dashboard and add your debts with balances and minimums.</li>
              <li>Record payments as you make them; overpayments are guarded.</li>
              <li>Follow the snowball order and watch the remaining balance drop.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
