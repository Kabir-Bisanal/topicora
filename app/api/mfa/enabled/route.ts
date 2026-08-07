import { recordAuditEvent } from "@/lib/audit/log";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  if (!supabase) return Response.json({ ok: false }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!user || assurance.data?.currentLevel !== "aal2")
    return Response.json({ ok: false }, { status: 401 });
  const admin = createAdminClient();
  await admin
    ?.from("profiles")
    .update({ mfa_required: true })
    .eq("id", user.id);
  await recordAuditEvent({
    actorId: user.id,
    action: "security.mfa_enabled",
    entityType: "profiles",
    entityId: user.id,
  });
  return Response.json({ ok: true });
}
