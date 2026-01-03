import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage({ searchParams, }: { searchParams: Promise<{ token?: string }>; }) {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    redirect("/dashboard")
  };

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <ResetPasswordInner searchParams={searchParams} />
      </div>
    </div>
  );
}

async function ResetPasswordInner({ searchParams, }: { searchParams: Promise<{ token?: string }>; }) {

  const { token } = await searchParams;

  if (!token) {
    return (
      <p className="text-sm text-red-500">
        Reset token missing. Check your link or request a new email.
      </p>
    );
  }

  return <ResetPasswordForm token={token} />;
}
