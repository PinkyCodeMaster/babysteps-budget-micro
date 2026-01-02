import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stack = [
  { label: "Framework", value: "Next.js 16 (App Router) + TypeScript" },
  { label: "Database", value: "Neon Postgres" },
  { label: "ORM", value: "Drizzle ORM" },
  { label: "UI", value: "shadcn/ui + Tailwind CSS" },
  { label: "Runtime", value: "Server-first API routes with validation" },
  { label: "Styling", value: "Light/dark themes with next-themes" },
];

const principles = [
  "Derived data: balances come from payments, not duplicates.",
  "Server validation: guard rails on amounts and overpayments.",
  "Simple UX: clear states, empty guidance, no dead ends.",
  "Deploy-ready: .env template, screenshots, and clean README.",
];

export default function TechStackPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-6 py-12 space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-primary">How it’s built</p>
          <h1 className="text-3xl font-bold">Technology and principles</h1>
          <p className="text-muted-foreground max-w-2xl">
            A lean, production-ready stack focused on correctness, clarity, and fast onboarding.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {stack.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="font-medium text-foreground">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Principles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-4">
                {principles.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Plug in auth so each user sees their own debts.</p>
            <p>Add locale-aware currency formatting and export/import if needed.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
