import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-primary/10 backdrop-blur">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
