import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/supabase/proxy";
import { getRedirectTarget } from "@/lib/seo/redirects";

export async function proxy(request: NextRequest) {
  const target = await getRedirectTarget(request.nextUrl.pathname);
  if (target) return NextResponse.redirect(new URL(target, request.url), 308);
  return refreshSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
