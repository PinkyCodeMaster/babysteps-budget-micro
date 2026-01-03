import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Database, Hammer, Monitor, ShieldCheck, TrendingUp, Compass, Rocket } from "lucide-react";

const stack = [
  { label: "Framework", value: "Next.js 16 (App Router) + TypeScript", icon: Monitor },
  { label: "Database", value: "Neon Postgres", icon: Database },
  { label: "ORM", value: "Drizzle ORM", icon: Hammer },
  { label: "UI", value: "shadcn/ui + Tailwind CSS", icon: Layers },
  { label: "Runtime", value: "Server-first API routes with validation", icon: ShieldCheck },
  { label: "Styling", value: "Intentional light/dark palettes with next-themes", icon: Compass },
];

const principles = [
  "Derived data: balances come from payments, not duplicates.",
  "Server validation: guardrails on amounts and overpayments.",
  "Simple UX: clear states, empty guidance, no dead ends.",
  "Deploy-ready: .env template, screenshots, and clean README.",
];

export default function TechStackPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            How it is built
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Technology and principles</h1>
          <p className="max-w-2xl text-muted-foreground">
            A lean, production-ready stack focused on correctness, clarity, and fast onboarding.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {stack.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/60 p-3">
                    <div className="mt-[2px] rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p>{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Principles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-4">
                {principles.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="font-medium">Auth and data separation</span>
            </div>
            <p className="pl-6">Plug in auth so each user sees their own debts.</p>
            <div className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">Quality of life</span>
            </div>
            <p className="pl-6">Add locale-aware currency formatting and export/import if needed.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
