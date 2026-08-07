import { hasPublicSupabaseEnv, publicEnv } from "@/lib/env/public";

type RedirectRule = { from: string; to: string };
let cached: { expiresAt: number; rules: RedirectRule[] } | null = null;

function validRule(value: unknown): value is RedirectRule {
  if (!value || typeof value !== "object") return false;
  const rule = value as Partial<RedirectRule>;
  return Boolean(
    rule.from?.startsWith("/") &&
    !rule.from.startsWith("//") &&
    rule.to?.startsWith("/") &&
    !rule.to.startsWith("//") &&
    rule.from !== rule.to &&
    !rule.from.startsWith("/admin") &&
    !rule.to.startsWith("/admin"),
  );
}

export async function getRedirectTarget(pathname: string) {
  if (!hasPublicSupabaseEnv) return null;
  if (!cached || cached.expiresAt <= Date.now()) {
    try {
      const endpoint = new URL(
        "/rest/v1/site_settings",
        publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
      );
      endpoint.searchParams.set("key", "eq.public.redirects");
      endpoint.searchParams.set("select", "value");
      const response = await fetch(endpoint, {
        headers: {
          apikey: publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        next: { revalidate: 60 },
      });
      const rows = (await response.json()) as { value?: unknown }[];
      const rules = Array.isArray(rows?.[0]?.value)
        ? rows[0].value.filter(validRule)
        : [];
      cached = { expiresAt: Date.now() + 60_000, rules };
    } catch {
      cached = { expiresAt: Date.now() + 15_000, rules: [] };
    }
  }
  return cached.rules.find((rule) => rule.from === pathname)?.to ?? null;
}
