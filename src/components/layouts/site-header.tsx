"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/components/layouts/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();

  const links = [
    { href: "/", label: "Home" },
    { href: "/techstack", label: "Tech stack" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          BabySteps
        </Link>
        <div className="flex items-center gap-3 sm:hidden">
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        <nav
          className={cn(
            "items-center gap-3 text-sm transition-all",
            open
              ? "absolute left-0 right-0 top-full z-20 flex flex-col bg-background/95 p-4 shadow-lg sm:static sm:flex-row sm:bg-transparent sm:p-0 sm:shadow-none"
              : "hidden sm:flex"
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-3 py-2 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="hidden items-center gap-2 sm:flex">
            {session.data?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded px-3 py-2 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <span className="text-xs text-muted-foreground">{session.data.user.email}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/sign-in");
                        },
                      },
                    });
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="rounded px-3 py-2 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
            <ModeToggle />
          </div>

          <div className="flex w-full flex-col gap-2 border-t border-border/60 pt-3 sm:hidden">
            {session.data?.user ? (
              <>
                <span className="text-xs text-muted-foreground">{session.data.user.email}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    authClient.signOut();
                    setOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="rounded px-3 py-2 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
