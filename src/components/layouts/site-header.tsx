"use client";

import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "@/components/layouts/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SiteHeader() {
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();

  return (
    <header className="border-b bg-white/80 backdrop-blur dark:bg-slate-900/70">
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
            ☰
          </Button>
        </div>
        <nav
          className={cn(
            "hidden sm:flex items-center gap-3 text-sm",
            open && "absolute left-0 right-0 top-full z-20 flex flex-col bg-white/95 p-4 shadow-md dark:bg-slate-900/95 sm:static sm:bg-transparent sm:p-0 sm:shadow-none"
          )}
        >
          <Link
            href="/"
            className="rounded px-2 py-1 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/techstack"
            className="rounded px-2 py-1 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            Tech stack
          </Link>


          <div className="hidden sm:flex items-center gap-2">
            {session.data?.user ? (

              <>
                <Link
                  href="/dashboard"
                  className="rounded px-2 py-1 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <span className="text-xs text-slate-500">
                  {session.data.user.email}
                </span>
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
                className="rounded px-2 py-1 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
            <ModeToggle />
          </div>
          <div className="sm:hidden flex flex-col gap-2 w-full">
            {session.data?.user ? (
              <>
                <span className="text-xs text-slate-500">
                  {session.data.user.email}
                </span>
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
                className="rounded px-2 py-1 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </div >
    </header >
  );
}
