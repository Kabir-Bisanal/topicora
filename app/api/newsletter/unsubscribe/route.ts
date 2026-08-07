import { recordAuditEvent } from "@/lib/audit/log";
import { validateSubscriberToken } from "@/lib/auth/subscriber-token";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return Response.redirect(
    new URL(
      `/newsletter/preferences?token=${encodeURIComponent(token)}`,
      request.url,
    ),
    303,
  );
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const subscriberId = validateSubscriberToken(token);
  if (!subscriberId) return new Response(null, { status: 400 });
  const supabase = createAdminClient();
  if (!supabase) return new Response(null, { status: 503 });
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
    metadata: { source: "one-click" },
  });
  return new Response(null, { status: 204 });
}
