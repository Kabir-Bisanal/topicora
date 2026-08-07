import { recordAuditEvent } from "@/lib/audit/log";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const session = await createClient();
  const {
    data: { user },
  } = (await session?.auth.getUser()) ?? { data: { user: null } };
  if (!user?.email) return Response.json({ ok: false }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return Response.json({ ok: false }, { status: 503 });
  const { data } = await admin
    .from("staff_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("auth_user_id", user.id)
    .eq("email", user.email)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();
  if (data)
    await recordAuditEvent({
      actorId: user.id,
      action: "staff.invitation_accepted",
      entityType: "staff_invitations",
      entityId: data.id,
    });
  return Response.json({ ok: true });
}
