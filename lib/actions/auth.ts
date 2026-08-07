"use server";

import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/actions/state";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/admin";

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Administrator login is unavailable until Supabase is configured." };
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "The email or password is incorrect." };
  const nextValue = String(formData.get("next") ?? "/admin");
  redirect(nextValue.startsWith("/admin") ? nextValue : "/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
