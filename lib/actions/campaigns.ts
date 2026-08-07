"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/actions/state";
import { fieldErrors } from "@/lib/actions/state";
import { requireAdmin } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  campaignIdSchema,
  campaignInputSchema,
} from "@/lib/validation/campaign";

function optional(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function scheduledDate(value: FormDataEntryValue | null, intent: string) {
  if (intent === "send") return new Date().toISOString();
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  const withZone = /(?:Z|[+-]\d\d:\d\d)$/.test(normalized)
    ? normalized
    : `${normalized}:00+05:30`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? "invalid" : date.toISOString();
}

function parseCampaign(formData: FormData) {
  const intent = String(formData.get("intent") ?? "draft");
  return campaignInputSchema.safeParse({
    subject: formData.get("subject"),
    preheader: optional(formData.get("preheader")),
    contentMarkdown: formData.get("content_markdown"),
    targetTopicSlugs: formData.getAll("topic_slugs").map(String),
    targetFrequency: optional(formData.get("target_frequency")),
    intent,
    scheduledAt: scheduledDate(formData.get("scheduled_at"), intent),
  });
}

function record(
  input: ReturnType<typeof campaignInputSchema.parse>,
  actorId: string,
) {
  return {
    subject: input.subject,
    preheader: input.preheader,
    content_markdown: input.contentMarkdown,
    target_topic_slugs: input.targetTopicSlugs,
    target_frequency: input.targetFrequency,
    status: input.intent === "draft" ? "draft" : "scheduled",
    scheduled_at: input.intent === "draft" ? null : input.scheduledAt,
    created_by: actorId,
  };
}

export async function createCampaignAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin("/admin/campaigns/new");
  const parsed = parseCampaign(formData);
  if (!parsed.success) return fieldErrors(parsed.error);
  const supabase = await createClient();
  if (!supabase)
    return { ok: false, message: "Campaign storage is unavailable." };
  const { data, error } = await supabase
    .from("newsletter_campaigns")
    .insert(record(parsed.data, actor.id))
    .select("id")
    .single();
  if (error || !data)
    return { ok: false, message: "The campaign could not be created." };
  revalidatePath("/admin/campaigns");
  redirect(`/admin/campaigns/${data.id}/edit?saved=1`);
}

export async function updateCampaignAction(
  id: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin(`/admin/campaigns/${id}/edit`);
  const parsedId = campaignIdSchema.safeParse(id);
  const parsed = parseCampaign(formData);
  if (!parsedId.success)
    return { ok: false, message: "Invalid campaign identifier." };
  if (!parsed.success) return fieldErrors(parsed.error);
  const supabase = await createClient();
  if (!supabase)
    return { ok: false, message: "Campaign storage is unavailable." };
  const { data: current } = await supabase
    .from("newsletter_campaigns")
    .select("status")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (!current || current.status === "sent" || current.status === "sending")
    return {
      ok: false,
      message: "A sending or completed campaign cannot be edited.",
    };
  const { error } = await supabase
    .from("newsletter_campaigns")
    .update(record(parsed.data, actor.id))
    .eq("id", parsedId.data);
  if (error) return { ok: false, message: "The campaign could not be saved." };
  revalidatePath("/admin/campaigns");
  redirect(`/admin/campaigns/${id}/edit?saved=1`);
}

export async function cancelCampaignAction(id: string, _formData: FormData) {
  void _formData;
  await requireAdmin("/admin/campaigns");
  const parsed = campaignIdSchema.safeParse(id);
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    ?.from("newsletter_campaigns")
    .update({ status: "cancelled" })
    .eq("id", parsed.data)
    .in("status", ["draft", "scheduled"]);
  revalidatePath("/admin/campaigns");
}
