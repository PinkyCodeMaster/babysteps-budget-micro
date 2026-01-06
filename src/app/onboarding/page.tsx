import { auth } from "@/lib/auth";
import { getOnboardingProgress } from "@/lib/onboarding";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OnboardingIndexPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const progress = await getOnboardingProgress(session.user.id);
  redirect(progress.nextPath);
}
