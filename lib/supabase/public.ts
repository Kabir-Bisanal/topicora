import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hasPublicSupabaseEnv, publicEnv } from "@/lib/env/public";

let cachedClient: SupabaseClient | null = null;

export function getPublicSupabase(): SupabaseClient | null {
  if (!hasPublicSupabaseEnv) return null;
  if (!cachedClient) {
    cachedClient = createClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }
  return cachedClient;
}
