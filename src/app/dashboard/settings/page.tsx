import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/layouts/theme-toggle";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

type SettingsProfile = {
  name: string;
  email: string;
  notifyEmails: boolean;
};

async function getSettings(): Promise<{ profile: SettingsProfile; currency: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const profile = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
    columns: { name: true, email: true, notifyEmails: true },
  });

  if (!profile) redirect("/sign-in");

  const cookieStore = await cookies();
  const currencyCookie =
    typeof cookieStore?.get === "function"
      ? cookieStore.get("currency")?.value?.toUpperCase() ?? "GBP"
      : "GBP";

  return { profile, currency: currencyCookie };
}

async function updateSettings(formData: FormData): Promise<void> {
  "use server";
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const notifyEmails =
    formData.get("notifyEmails") === "true" || formData.get("notifyEmails") === "on";
  const currencyRaw = (formData.get("currency") as string | null)?.toUpperCase() ?? "GBP";
  const allowedCurrency = ["GBP", "USD", "EUR"].includes(currencyRaw) ? currencyRaw : "GBP";

  await db
    .update(userTable)
    .set({ notifyEmails: notifyEmails, updatedAt: new Date() })
    .where(eq(userTable.id, session.user.id));

  const cookieStore = await cookies();
  // Response cookies are available in server actions; guard for environments without set().
  if (typeof (cookieStore as any)?.set === "function") {
    (cookieStore as any).set("currency", allowedCurrency, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export default async function SettingsPage() {
  const { profile, currency } = await getSettings();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-semibold">Settings</h1>
                  <p className="text-muted-foreground text-sm">
                    Fine-tune how the app feels. Appearance is instant; emails and currency save when you submit.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 px-4 pb-6 lg:grid-cols-2 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Switch between light, dark, or follow your system.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Theme</p>
                      <p className="text-xs text-muted-foreground">
                        Changes right away and stays on this device.
                      </p>
                    </div>
                    <ModeToggle />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Set your currency and choose if you want reminder emails.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={updateSettings} className="space-y-6">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="currency">Currency</FieldLabel>
                          <FieldContent>
                            <Select name="currency" defaultValue={currency}>
                              <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GBP">GBP (£) — Pound sterling</SelectItem>
                                <SelectItem value="USD">USD ($) — US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR (€) — Euro</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              We will remember this on this device. More currencies coming soon.
                            </p>
                          </FieldContent>
                        </Field>

                        <Field orientation="responsive">
                          <FieldLabel htmlFor="notifyEmails">Email reminders</FieldLabel>
                          <FieldContent className="flex items-center justify-between rounded-lg border px-4 py-3">
                            <div>
                              <p className="font-medium">Payment nudges</p>
                              <p className="text-muted-foreground text-sm">
                                Get gentle reminders for upcoming due dates and monthly progress.
                              </p>
                            </div>
                            <Checkbox
                              id="notifyEmails"
                              name="notifyEmails"
                              value="true"
                              defaultChecked={profile.notifyEmails}
                              className="size-5"
                            />
                          </FieldContent>
                        </Field>
                      </FieldGroup>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Signed in as {profile.email}
                        </div>
                        <Button type="submit">Save settings</Button>
                      </div>
                    </form>
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
