import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { getOnboardingProgress } from "@/lib/onboarding";

export default async function SignInPage() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session) {
        const progress = await getOnboardingProgress(session.user.id)
        redirect(progress.step === "done" ? "/dashboard" : progress.nextPath)
    }

    return (
        <div className="flex flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-primary/10 backdrop-blur">
                <LoginForm />
            </div>
        </div>
    )
}
