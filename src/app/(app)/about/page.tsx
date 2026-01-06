import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Database, CloudRain, ShieldCheck, Rocket, Smartphone, MailCheck } from "lucide-react";

const stack = [
  { label: "Framework and UI", value: "Next.js 16 (App Router), TypeScript, shadcn/ui, Tailwind CSS", icon: Layers },
  { label: "Data layer", value: "Drizzle ORM over Neon Postgres with schema-first migrations", icon: Database },
  { label: "Storage", value: "S3-compatible bucket via MinIO for exports and receipts", icon: CloudRain },
  { label: "Email", value: "React Email templates, Mailpit for local dev, Resend for production sends", icon: MailCheck },
  { label: "Reliability", value: "Sentry instrumentation plus Vercel Analytics for runtime insight", icon: ShieldCheck },
  { label: "Mobile next", value: "Expo client planned to share the same API and auth flow", icon: Smartphone },
];

const principles = [
  "Manual-first: no bank scraping or ads. You own the numbers you type.",
  "Protect essentials: rent, council tax, and arrears are guarded before snowballing.",
  "Server-side validation: amounts, overpayments, and UC taper inputs are checked on the server.",
  "Readable in any light: dark and light modes share the same rhythm and contrast targets.",
  "Deliverability by default: local emails stay in Mailpit; production uses Resend with verified domains.",
];

const operations = [
  {
    title: "Built to ship",
    body: "Environment templates, screenshots, and scripts come ready for production deploys without rewriting the stack.",
    icon: Rocket,
  },
  {
    title: "Data you can audit",
    body: "Balances derive from payments, not duplicate fields. Exports and backups use S3-compatible storage you control.",
    icon: ShieldCheck,
  },
  {
    title: "UK-first approach",
    body: "Copy, empty states, and calculations reference UC, mixed paydays, and priority debts instead of generic US flows.",
    icon: Layers,
  },
];

export const metadata = {
  title: "About | BabySteps",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            About the product
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Debt snowball built for the UK</h1>
          <p className="max-w-3xl text-muted-foreground">
            BabySteps takes the Ramsey-style snowball and pairs it with calm UI, server-first guardrails, and an
            operations stack that is ready for production use.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">What we care about</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-4">
                {principles.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Why it exists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                The app is for households that want the clarity of the debt snowball without handing bank access to third
                parties. It respects priority debts, keeps UC and mixed wages in view, and stays calm enough to use when
                things are stressful.
              </p>
              <p className="text-foreground font-medium">
                No marketing sprawl - just a focused place to track balances, payments, and the cash you can safely use
                to clear debt.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Stack and operations
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tools chosen for reliability</h2>
          <p className="max-w-3xl text-muted-foreground">
            The stack is simple to deploy and maintain. Nothing exotic - just proven parts assembled for speed, safety,
            and clarity.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {stack.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="border border-border/60 bg-card/70 shadow-sm shadow-primary/5 backdrop-blur"
                >
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">{item.value}</CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {operations.map((item) => {
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
