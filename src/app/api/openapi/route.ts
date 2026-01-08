import { buildOpenApiSpec } from "@/lib/openapi";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const spec = buildOpenApiSpec(origin);

  return Response.json(spec, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
