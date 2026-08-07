import "server-only";

import { validateSubscriberToken } from "@/lib/auth/subscriber-token";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getSubscriberPreferences(token: string) {
  const subscriberId = validateSubscriberToken(token);
  if (!subscriberId) return null;
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id,email,status,topic_slugs,frequency")
    .eq("id", subscriberId)
    .maybeSingle();
  return data;
}
