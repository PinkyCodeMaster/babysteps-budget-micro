import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userEmail = session?.user.email;
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-background/80">
      <header className="border-b border-border/60 bg-card/70 backdrop-blur">
        <div className="mx-auto flex container items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            BabySteps Onboarding
          </div>
          {userEmail ? (
            <span className="text-sm text-muted-foreground">Signed in as {userEmail}</span>
          ) : (
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
              Already have an account?
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-64px)] container flex-col gap-6 px-4 py-10">
        {children}
      </main>
    </div>
  );
}
