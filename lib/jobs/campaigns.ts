import "server-only";

import { recordAuditEvent } from "@/lib/audit/log";
import { createSubscriberToken } from "@/lib/auth/subscriber-token";
import {
  isCampaignEmailConfigured,
  sendNewsletterCampaign,
} from "@/lib/email/resend";
import { absoluteUrl } from "@/lib/seo/metadata";
import { createAdminClient } from "@/lib/supabase/admin";

type Campaign = {
  id: string;
  subject: string;
  preheader: string | null;
  content_markdown: string;
  target_topic_slugs: string[];
  target_frequency: "weekly" | "monthly" | null;
};

type Subscriber = {
  id: string;
  email: string;
  status: string;
  topic_slugs: string[];
  frequency: "weekly" | "monthly";
};

function matchesCampaign(subscriber: Subscriber, campaign: Campaign) {
  if (subscriber.status !== "active") return false;
  if (
    campaign.target_frequency &&
    subscriber.frequency !== campaign.target_frequency
  )
    return false;
  return (
    campaign.target_topic_slugs.length === 0 ||
    subscriber.topic_slugs.length === 0 ||
    campaign.target_topic_slugs.some((topic) =>
      subscriber.topic_slugs.includes(topic),
    )
  );
}

async function enqueueEligibleSubscribers(campaign: Campaign) {
  const supabase = createAdminClient();
  if (!supabase) return;
  const pageSize = 500;
  for (let start = 0; ; start += pageSize) {
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("id,email,status,topic_slugs,frequency")
      .eq("status", "active")
      .range(start, start + pageSize - 1);
    const subscribers = (data ?? []) as Subscriber[];
    const eligible = subscribers.filter((subscriber) =>
      matchesCampaign(subscriber, campaign),
    );
    if (eligible.length)
      await supabase.from("newsletter_deliveries").upsert(
        eligible.map((subscriber) => ({
          campaign_id: campaign.id,
          subscriber_id: subscriber.id,
          status: "queued",
        })),
        {
          onConflict: "campaign_id,subscriber_id",
          ignoreDuplicates: true,
        },
      );
    if (subscribers.length < pageSize) break;
  }
}

export async function processDueCampaigns() {
  if (!isCampaignEmailConfigured())
    return {
      ok: false as const,
      processed: 0,
      message: "Email not configured",
    };
  const supabase = createAdminClient();
  if (!supabase)
    return { ok: false as const, processed: 0, message: "Not configured" };
  const { data, error } = await supabase.rpc("claim_due_campaigns", {
    batch_size: 5,
  });
  if (error)
    return { ok: false as const, processed: 0, message: error.message };
  const campaigns = (data ?? []) as Campaign[];
  let delivered = 0;

  for (const campaign of campaigns) {
    await enqueueEligibleSubscribers(campaign);
    const { data: queued } = await supabase
      .from("newsletter_deliveries")
      .select(
        "id,attempts,subscriber:newsletter_subscribers(id,email,status,topic_slugs,frequency)",
      )
      .eq("campaign_id", campaign.id)
      .in("status", ["queued", "failed"])
      .lt("attempts", 3)
      .order("created_at")
      .limit(40);

    for (const delivery of queued ?? []) {
      const subscriber = (
        Array.isArray(delivery.subscriber)
          ? delivery.subscriber[0]
          : delivery.subscriber
      ) as Subscriber | null;
      if (!subscriber || !matchesCampaign(subscriber, campaign)) {
        await supabase
          .from("newsletter_deliveries")
          .update({ status: "skipped", last_error: "No longer eligible." })
          .eq("id", delivery.id);
        continue;
      }
      const token = createSubscriberToken(subscriber.id);
      if (!token) continue;
      const preferencesUrl = absoluteUrl(
        `/newsletter/preferences?token=${encodeURIComponent(token)}`,
      );
      const unsubscribeUrl = absoluteUrl(
        `/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
      );
      await supabase
        .from("newsletter_deliveries")
        .update({ status: "sending", attempts: delivery.attempts + 1 })
        .eq("id", delivery.id);
      const result = await sendNewsletterCampaign({
        email: subscriber.email,
        subject: campaign.subject,
        preheader: campaign.preheader,
        contentMarkdown: campaign.content_markdown,
        preferencesUrl,
        unsubscribeUrl,
      });
      if (result.sent) {
        await supabase
          .from("newsletter_deliveries")
          .update({
            status: "sent",
            provider_message_id: result.id,
            sent_at: new Date().toISOString(),
            last_error: null,
          })
          .eq("id", delivery.id);
        delivered += 1;
      } else {
        const attempts = delivery.attempts + 1;
        await supabase
          .from("newsletter_deliveries")
          .update({
            status: attempts >= 3 ? "skipped" : "failed",
            last_error: result.reason,
          })
          .eq("id", delivery.id);
      }
    }

    const { count: pending } = await supabase
      .from("newsletter_deliveries")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .in("status", ["queued", "sending", "failed"]);
    if (!pending) {
      await supabase
        .from("newsletter_campaigns")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", campaign.id);
      await recordAuditEvent({
        actorId: null,
        action: "newsletter.campaign_sent",
        entityType: "newsletter_campaigns",
        entityId: campaign.id,
      });
    }
  }
  return {
    ok: true as const,
    campaigns: campaigns.length,
    processed: delivered,
  };
}
