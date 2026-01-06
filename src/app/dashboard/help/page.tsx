import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const faqs = [
  {
    title: "Why is UC showing £0?",
    body: "Add a UC entry or set UC_BASE_MONTHLY; the taper ignores UC income when calculating the deduction.",
  },
  {
    title: "Payment dates on holidays?",
    body: "We auto-roll weekends/bank holidays to the next working day on reminders and schedules.",
  },
  {
    title: "Emails not arriving?",
    body: "Check RESEND_API_KEY/RESEND_FROM or ensure Mailpit is running locally; verify spam and sender domain.",
  },
];

export default async function HelpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-wrap items-start justify-between gap-4 px-4 lg:px-6">
                <div className="space-y-2">
                  <Badge variant="secondary">Get help</Badge>
                  <h1 className="text-3xl font-semibold">We will keep you moving forward</h1>
                  <p className="max-w-2xl text-muted-foreground">
                    Quick answers, links, and contacts. No judgment—just practical fixes to keep your plan on track.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="mailto:support@babysteps.app">
                    <Button size="lg">Email support</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg">
                      Back to dashboard
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 px-4 pb-6 lg:grid-cols-[1.1fr,0.9fr] lg:px-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Quick checks</CardTitle>
                    <CardDescription>Common fixes you can do in under a minute.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-secondary/40 p-4">
                      <p className="font-medium">Reminders not sending?</p>
                      <p className="text-muted-foreground text-sm">
                        Confirm CRON_SECRET is set in Vercel and your cron job calls <code>/api/cron/notify</code> with
                        the bearer token.
                      </p>
                    </div>
                    <div className="rounded-lg border bg-secondary/40 p-4">
                      <p className="font-medium">UC looks off?</p>
                      <p className="text-muted-foreground text-sm">
                        Make sure your UC entry is typed as &quot;UC&quot; or named &quot;Universal Credit.&quot; The
                        taper uses the first £411 disregard and 55% rate by default (configurable via env).
                      </p>
                    </div>
                    <div className="rounded-lg border bg-secondary/40 p-4">
                      <p className="font-medium">Charts feel noisy?</p>
                      <p className="text-muted-foreground text-sm">
                        Hide extra cards by focusing on the snowball view, or switch themes in the header to reduce
                        glare.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Contact and status</CardTitle>
                    <CardDescription>Reach us or check the essentials.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Email us</p>
                        <p className="text-muted-foreground text-sm">support@babysteps.app</p>
                      </div>
                      <Link href="mailto:support@babysteps.app">
                        <Button variant="outline">Open mail</Button>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Cron health</p>
                        <p className="text-muted-foreground text-sm">Call GET /api/cron/notify with your bearer token.</p>
                      </div>
                      <Link href="/api/cron/notify">
                        <Button variant="outline">Check</Button>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">Security</p>
                        <p className="text-muted-foreground text-sm">Sessions and data stay server-side; no bank links.</p>
                      </div>
                      <Link href="/privacy">
                        <Button variant="outline">Privacy</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="px-4 pb-6 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>FAQs</CardTitle>
                    <CardDescription>Short answers for common hiccups.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    {faqs.map((item) => (
                      <div key={item.title} className="rounded-lg border p-4">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-muted-foreground text-sm">{item.body}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
