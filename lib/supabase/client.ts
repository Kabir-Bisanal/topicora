"use client";

import { createBrowserClient } from "@supabase/ssr";

import { hasPublicSupabaseEnv, publicEnv } from "@/lib/env/public";

export function createClient() {
  if (!hasPublicSupabaseEnv) return null;

  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
