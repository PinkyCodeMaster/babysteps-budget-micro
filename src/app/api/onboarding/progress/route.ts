import { auth } from "@/lib/auth";
import { getOnboardingProgress } from "@/lib/onboarding";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const progress = await getOnboardingProgress(session.user.id);
  return NextResponse.json({ step: progress.step, nextPath: progress.nextPath });
}
