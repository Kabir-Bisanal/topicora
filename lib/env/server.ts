import "server-only";

import { parseServerEnv } from "@/lib/env/schema";

export function getServerEnv() {
  return parseServerEnv(process.env);
}

export function hasServiceRoleEnv() {
  const env = getServerEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}
