import { SignupForm } from "@/components/auth/signup-form";
import { auth } from "@/lib/auth";
import { getOnboardingProgress } from "@/lib/onboarding";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    const progress = await getOnboardingProgress(session.user.id);
    redirect(progress.step === "done" ? "/dashboard" : progress.nextPath);
  }
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-primary/10 backdrop-blur">
        <SignupForm />
      </div>
    </div>
  );
}
