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
    .select("id, display_name, slug, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return { ...profile, role: profile.role as AppRole, email: user.email ?? "" };
}

export async function requireStaff(returnTo = "/admin") {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/admin/login?next=${encodeURIComponent(returnTo)}`);
  if (!canAccessAdmin(profile.role)) redirect("/");
  return profile;
}

export async function requireAdmin(returnTo = "/admin") {
  const profile = await requireStaff(returnTo);
  if (profile.role !== "admin") redirect("/admin");
  return profile;
}
