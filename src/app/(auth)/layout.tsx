import { GalleryVerticalEnd } from "lucide-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-[radial-gradient(circle_at_12%_18%,rgba(16,163,118,0.12),transparent_36%),radial-gradient(circle_at_88%_4%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(240,244,248,0.9))] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(52,211,153,0.18),transparent_36%),radial-gradient(circle_at_88%_4%,rgba(56,189,248,0.18),transparent_32%),linear-gradient(180deg,rgba(16,24,40,0.94),rgba(11,18,32,0.96))] flex flex-col gap-4 p-6 md:p-10">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              BabySteps
            </Link>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-muted-foreground shadow-sm backdrop-blur">
            UK-first debt snowball with no bank scraping. Guardrails for UC, rent, and essentials match what you saw on
            the homepage.
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1591033594798-33227a05780d?q=80&w=1518&auto=format&fit=crop"
          alt="credit to:https://unsplash.com/@snowjam"
          fill
          priority
          sizes="(min-width:1024px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-background/60 via-background/40 to-background/70" />
      </div>
    </div>
  );
}
