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
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

async function getProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const profile = await db.query.user.findFirst({
    where: eq(userTable.id, session.user.id),
    columns: { name: true, email: true, createdAt: true },
  });

  if (!profile) redirect("/sign-in");

  return profile;
}

async function updateProfile(formData: FormData): Promise<void> {
  "use server";
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const name = (formData.get("name") as string | null)?.trim() ?? "";

  if (name.length < 2 || name.length > 120) return;

  await db
    .update(userTable)
    .set({ name, updatedAt: new Date() })
    .where(eq(userTable.id, session.user.id));

  revalidatePath("/dashboard/account");
}

async function changePassword(formData: FormData): Promise<void> {
  "use server";
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const currentPassword = (formData.get("currentPassword") as string | null) ?? "";
  const newPassword = (formData.get("newPassword") as string | null) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";

  if (newPassword !== confirmPassword) return;

  if (newPassword.length < 8) return;

  await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: await headers(),
  });

  revalidatePath("/dashboard/account");
}

export default async function AccountPage() {
  const profile = await getProfile();

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
                  <h1 className="text-2xl font-semibold">Account</h1>
                  <p className="text-muted-foreground text-sm">
                    Update your name and keep your password fresh. Email and settings live elsewhere.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 px-4 pb-6 lg:grid-cols-2 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      Keep your name up to date. Email is used for sign-in and notices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={updateProfile} className="space-y-6">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="name">Full name</FieldLabel>
                          <FieldContent>
                            <Input
                              id="name"
                              name="name"
                              defaultValue={profile.name}
                              minLength={2}
                              maxLength={120}
                              required
                            />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <FieldContent>
                            <Input
                              id="email"
                              name="email"
                              defaultValue={profile.email}
                              disabled
                            />
                            <p className="text-muted-foreground text-xs">
                              Email changes will come later; for now contact support if you need this updated.
                            </p>
                          </FieldContent>
                        </Field>
                      </FieldGroup>

                      <Button type="submit">Save changes</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password and sign out of other sessions if needed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={changePassword} className="space-y-4">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            minLength={8}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            minLength={8}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={8}
                          />
                        </Field>
                      </FieldGroup>
                      <Button type="submit" variant="secondary">
                        Update password
                      </Button>
                      <p className="text-muted-foreground text-xs">
                        After a password change we log out other active sessions for safety.
                      </p>
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
