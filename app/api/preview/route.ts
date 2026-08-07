import { NextResponse } from "next/server";

import { canAccessAdmin } from "@/lib/auth/permissions";
import { createPreviewToken } from "@/lib/auth/preview";
import { getCurrentProfile } from "@/lib/auth/server";
import { articleIdSchema } from "@/lib/validation/article";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || !canAccessAdmin(profile.role)) return NextResponse.redirect(new URL("/admin/login", request.url));
  const articleId = new URL(request.url).searchParams.get("article");
  const parsed = articleIdSchema.safeParse(articleId);
  if (!parsed.success) return new Response("Invalid article", { status: 400 });
  const token = createPreviewToken(parsed.data);
  if (!token) return new Response("Preview is unavailable until server credentials are configured.", { status: 503 });
  return NextResponse.redirect(new URL(`/preview/${parsed.data}?token=${encodeURIComponent(token)}`, request.url));
}
