import "server-only";

import { createHash } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

type Entry = { hits: number; startedAt: number };
const memory = new Map<string, Entry>();

export async function checkRateLimit(
  scope: string,
  fingerprint: string,
  limit: number,
  windowSeconds: number,
) {
  const keyHash = createHash("sha256")
    .update(`${scope}:${fingerprint}`)
    .digest("hex");
  const supabase = createAdminClient();
  if (supabase) {
    const { data, error } = await supabase.rpc("check_form_rate_limit", {
      rate_key: keyHash,
      max_hits: limit,
      window_seconds: windowSeconds,
    });
    if (!error && typeof data === "boolean") return data;
    if (process.env.NODE_ENV === "production") return false;
  }

  const now = Date.now();
  const existing = memory.get(keyHash);
  if (!existing || now - existing.startedAt >= windowSeconds * 1000) {
    memory.set(keyHash, { hits: 1, startedAt: now });
    return true;
  }
  existing.hits += 1;
  return existing.hits <= limit;
}
