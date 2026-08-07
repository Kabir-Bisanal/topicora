import "server-only";

import { redirect } from "next/navigation";

import { canAccessAdmin, type AppRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, slug, role, mfa_required")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  const [assurance, factors] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);
  return {
    ...profile,
    role: profile.role as AppRole,
    email: user.email ?? "",
    currentAal: assurance.data?.currentLevel ?? "aal1",
    verifiedFactorCount: factors.data?.totp.length ?? 0,
  };
}

export async function requireStaff(
  returnTo = "/admin",
  options: { enforceMfa?: boolean } = {},
) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/admin/login?next=${encodeURIComponent(returnTo)}`);
  if (!canAccessAdmin(profile.role)) redirect("/");
  if (
    profile.mfa_required &&
    options.enforceMfa !== false &&
    profile.currentAal !== "aal2"
  ) {
    const destination =
      profile.verifiedFactorCount > 0
        ? "/admin/security?mode=verify"
        : "/admin/security?mode=setup";
    redirect(`${destination}&next=${encodeURIComponent(returnTo)}`);
  }
  return profile;
}

export async function requireAdmin(
  returnTo = "/admin",
  options: { enforceMfa?: boolean } = {},
) {
  const profile = await requireStaff(returnTo, options);
  if (profile.role !== "admin") redirect("/admin");
  return profile;
}
