import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, ShieldCheck, Moon, Globe } from "lucide-react";

const cookies = [
  {
    title: "Session cookies",
    icon: ShieldCheck,
    body: "Required to keep you signed in and secure. These are essential for the app to work and cannot be turned off without signing out.",
  },
  {
    title: "Preferences",
    icon: Moon,
    body: "We store your theme choice and cookie consent in local storage. This keeps the site consistent between visits.",
  },
  {
    title: "Analytics and reliability",
    icon: Globe,
    body: "Vercel analytics and Sentry error reporting may set lightweight identifiers to measure performance and stability. No marketing or ad tracking pixels are used.",
  },
];

export const metadata = {
  title: "Cookies | BabySteps",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Cookie notice
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">How we use cookies</h1>
          <p className="max-w-2xl text-muted-foreground">
            We only use cookies and local storage needed to run BabySteps and keep your preferences. There are no ad or
            marketing trackers.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {cookies.map((item) => {
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
            <p>If you have questions about cookies or want them cleared, email privacy@babysteps.app.</p>
            <p className="text-foreground">
              You can also clear local storage or use your browser settings to remove cookies at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
