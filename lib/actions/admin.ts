"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireStaff } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema, statusUpdateSchema } from "@/lib/validation/admin";

export async function updateMessageStatusAction(formData: FormData) {
  await requireStaff("/admin/messages");
  const parsed = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (
    !parsed.success ||
    !["new", "read", "resolved"].includes(parsed.data.status)
  )
    return;
  const supabase = await createClient();
  await supabase
    ?.from("contact_messages")
    .update({
      status: parsed.data.status,
      resolved_at:
        parsed.data.status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.id);
  revalidatePath("/admin/messages");
}

export async function updateSubscriberStatusAction(formData: FormData) {
  await requireAdmin("/admin/subscribers");
  const parsed = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (
    !parsed.success ||
    !["pending", "active", "unsubscribed"].includes(parsed.data.status)
  )
    return;
  const supabase = await createClient();
  await supabase
    ?.from("newsletter_subscribers")
    .update({
      status: parsed.data.status,
      confirmed_at:
        parsed.data.status === "active" ? new Date().toISOString() : null,
      unsubscribed_at:
        parsed.data.status === "unsubscribed" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.id);
  revalidatePath("/admin/subscribers");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin("/admin/settings");
  const parsed = siteSettingsSchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    redirects: formData.get("redirects"),
  });
  if (!parsed.success) return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("site_settings").upsert([
    {
      key: "public.publication",
      value: { name: parsed.data.name, tagline: parsed.data.tagline },
    },
    {
      key: "public.redirects",
      value: JSON.parse(parsed.data.redirects) as unknown,
    },
  ]);
  revalidatePath("/admin/settings");
  revalidatePath("/");
}
