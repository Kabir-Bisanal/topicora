import { recordAuditEvent } from "@/lib/audit/log";
import { validateSubscriberToken } from "@/lib/auth/subscriber-token";
import { isSameOrigin } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterPreferencesSchema } from "@/lib/validation/public-forms";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ message: "Request rejected." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = newsletterPreferencesSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ message: "Check your choices." }, { status: 400 });
  const subscriberId = validateSubscriberToken(parsed.data.token);
  if (!subscriberId)
    return Response.json(
      { message: "This preference link is invalid." },
      { status: 401 },
    );
  const supabase = createAdminClient();
  if (!supabase)
    return Response.json(
      { message: "Newsletter preferences are unavailable." },
      { status: 503 },
    );
  if (parsed.data.action === "unsubscribe") {
    await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        preferences_updated_at: new Date().toISOString(),
      })
      .eq("id", subscriberId);
    await recordAuditEvent({
      actorId: null,
      action: "newsletter.unsubscribed",
      entityType: "newsletter_subscribers",
      entityId: subscriberId,
      metadata: { source: "preference-center" },
    });
    return Response.json({ message: "You have been unsubscribed." });
  }
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("status")
    .eq("id", subscriberId)
    .maybeSingle();
  if (data?.status !== "active")
    return Response.json(
      { message: "Confirm or resubscribe this address before saving." },
      { status: 409 },
    );
  await supabase
    .from("newsletter_subscribers")
    .update({
      topic_slugs: parsed.data.topicSlugs,
      frequency: parsed.data.frequency,
      preferences_updated_at: new Date().toISOString(),
    })
    .eq("id", subscriberId);
  return Response.json({ message: "Your preferences have been saved." });
}
