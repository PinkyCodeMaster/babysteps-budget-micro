import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

function isEnabled(value: string | undefined | null) {
  if (!value) return false;
  return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "yes";
}

// Health-check by default; allow a deliberate throw only when explicitly enabled.
export function GET(request: Request) {
  const url = new URL(request.url);
  const wantsThrow = isEnabled(url.searchParams.get("throw"));
  const throwEnabled = isEnabled(process.env.SENTRY_TEST_MODE);

  if (wantsThrow && !throwEnabled) {
    return Response.json(
      { error: "Sentry test mode disabled. Set SENTRY_TEST_MODE=1 to enable throwing." },
      { status: 403 }
    );
  }

  if (wantsThrow && throwEnabled) {
    Sentry.logger.info("Sentry test error triggered");
    throw new SentryExampleAPIError("Intentional Sentry test error.");
  }

  return Response.json({ ok: true, service: "sentry-example-api" });
}
