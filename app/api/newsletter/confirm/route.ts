import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token || token.length > 200) return NextResponse.redirect(new URL("/newsletter/confirmed?status=invalid", request.url));
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.redirect(new URL("/newsletter/confirmed?status=unavailable", request.url));
  const hash = createHash("sha256").update(token).digest("hex");
  const { data } = await supabase.from("newsletter_subscribers").select("id,status").eq("confirmation_token_hash", hash).maybeSingle();
  if (!data) return NextResponse.redirect(new URL("/newsletter/confirmed?status=invalid", request.url));
  if (data.status !== "active") await supabase.from("newsletter_subscribers").update({ status: "active", confirmed_at: new Date().toISOString(), confirmation_token_hash: null, unsubscribed_at: null }).eq("id", data.id);
  return NextResponse.redirect(new URL("/newsletter/confirmed?status=confirmed", request.url));
}
