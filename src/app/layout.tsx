import { ThemeProvider } from "@/components/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BabySteps - Budget Micro",
  description: "A finished, portfolio-ready debt snowball tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Global shell: header, theme toggle, gradient wrap, and toaster */}
          <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
            <header className="border-b bg-white/70 backdrop-blur dark:bg-slate-900/70">
              <div className="container mx-auto flex items-center justify-between px-6 py-4">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                  BabySteps
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                  <Link href="/" className="rounded px-2 py-1 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    Home
                  </Link>
                  <Link href="/dashboard" className="rounded px-2 py-1 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    Dashboard
                  </Link>
                  <ModeToggle />
                </nav>
              </div>
            </header>
            <div className="bg-linear-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
              {children}
            </div>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
