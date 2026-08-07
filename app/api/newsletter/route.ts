import { createHash, randomBytes } from "node:crypto";

import { sendNewsletterConfirmation } from "@/lib/email/resend";
import { absoluteUrl } from "@/lib/seo/metadata";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSameOrigin, requestFingerprint } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterSchema, submittedAtHumanSpeed } from "@/lib/validation/public-forms";

const generic = "If this address can be subscribed, it will receive the next confirmation step.";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ message: "Request rejected." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) return Response.json({ message: "Request is too large." }, { status: 413 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  if (body.website) return Response.json({ message: generic });
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success || !submittedAtHumanSpeed(parsed.data.startedAt)) return Response.json({ message: "Check your email and consent, then try again." }, { status: 400 });
  const allowed = await checkRateLimit("newsletter", requestFingerprint(request), 5, 3600);
  if (!allowed) return Response.json({ message: "Please wait before trying again." }, { status: 429 });
  const supabase = createAdminClient();
  if (!supabase) return Response.json({ message: "Newsletter signup is unavailable until the publication database is configured." }, { status: 503 });

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: existing } = await supabase.from("newsletter_subscribers").select("id,status").eq("email", parsed.data.email).maybeSingle();
  const shouldConfirm = existing?.status !== "active";
  if (existing) {
    if (shouldConfirm) await supabase.from("newsletter_subscribers").update({ status: "pending", confirmation_token_hash: tokenHash, consent_text: parsed.data.consentText, source: parsed.data.source, subscribed_at: new Date().toISOString(), confirmed_at: null, unsubscribed_at: null }).eq("id", existing.id);
  } else {
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email, status: "pending", confirmation_token_hash: tokenHash, source: parsed.data.source, consent_text: parsed.data.consentText });
    if (error && error.code !== "23505") return Response.json({ message: "Signup could not be saved. Please try again shortly." }, { status: 503 });
  }

  if (shouldConfirm) {
    const result = await sendNewsletterConfirmation(parsed.data.email, `${absoluteUrl("/api/newsletter/confirm")}?token=${encodeURIComponent(token)}`);
    if (!result.sent && result.reason === "not-configured") return Response.json({ message: "Your request was saved. Email confirmation is not configured in this local environment." });
  }
  return Response.json({ message: generic });
}
