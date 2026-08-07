import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/supabase/proxy";
import { getRedirectTarget } from "@/lib/seo/redirects";
import { evaluateEdgeRequest } from "@/lib/security/edge-guard";

export async function proxy(request: NextRequest) {
  const decision = evaluateEdgeRequest({
    pathname: request.nextUrl.pathname,
    method: request.method,
    contentLength: Number(request.headers.get("content-length") ?? 0),
    fetchSite: request.headers.get("sec-fetch-site"),
  });
  if (!decision.allowed)
    return NextResponse.json(
      { message: decision.message },
      {
        status: decision.status,
        headers: { "cache-control": "no-store" },
      },
    );
  const target = await getRedirectTarget(request.nextUrl.pathname);
  if (target) return NextResponse.redirect(new URL(target, request.url), 308);
  const response = await refreshSession(request);
  response.headers.set(
    "x-request-id",
    request.headers.get("x-vercel-id") || crypto.randomUUID(),
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
