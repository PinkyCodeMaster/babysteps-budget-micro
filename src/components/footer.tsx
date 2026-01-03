import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-foreground font-semibold">BabySteps</p>
          <p>Debt payoff, income, and expenses in one calm dashboard.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/contact" className="rounded px-2 py-1 hover:bg-primary/10 hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="rounded px-2 py-1 hover:bg-primary/10 hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="rounded px-2 py-1 hover:bg-primary/10 hover:text-foreground">
            Terms
          </Link>
          <Link href="/sign-in" className="rounded px-2 py-1 hover:bg-primary/10 hover:text-foreground">
            Sign in
          </Link>
          <Link href="/sign-up" className="rounded px-2 py-1 hover:bg-primary/10 hover:text-foreground">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
