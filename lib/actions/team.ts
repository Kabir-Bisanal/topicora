"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/state";
import { fieldErrors } from "@/lib/actions/state";
import { recordAuditEvent } from "@/lib/audit/log";
import { requireAdmin } from "@/lib/auth/server";
import { absoluteUrl } from "@/lib/seo/metadata";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  invitationIdSchema,
  staffInviteSchema,
  staffUpdateSchema,
} from "@/lib/validation/team";

export async function inviteStaffAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdmin("/admin/team");
  const parsed = staffInviteSchema.safeParse({
    email: formData.get("email"),
    displayName: formData.get("display_name"),
    role: formData.get("role"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const admin = createAdminClient();
  if (!admin)
    return { ok: false, message: "Staff invitations are not configured." };

  const { data: invitation, error: insertError } = await admin
    .from("staff_invitations")
    .insert({
      email: parsed.data.email,
      display_name: parsed.data.displayName,
      role: parsed.data.role,
      invited_by: actor.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();
  if (insertError || !invitation)
    return {
      ok: false,
      message: "A pending invitation already exists for that address.",
    };

  const { error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { display_name: parsed.data.displayName },
      redirectTo: absoluteUrl("/admin/invite/accept"),
    },
  );
  if (error) {
    await admin.from("staff_invitations").delete().eq("id", invitation.id);
    return {
      ok: false,
      message: error.message.includes("already")
        ? "That address already belongs to a Topicora user."
        : "The invitation email could not be sent.",
    };
  }
  await recordAuditEvent({
    actorId: actor.id,
    action: "staff.invited",
    entityType: "staff_invitations",
    entityId: invitation.id,
    metadata: { role: parsed.data.role },
  });
  revalidatePath("/admin/team");
  return { ok: true, message: "Invitation sent. It expires in 24 hours." };
}

export async function revokeInvitationAction(id: string, _formData: FormData) {
  void _formData;
  const actor = await requireAdmin("/admin/team");
  const parsed = invitationIdSchema.safeParse(id);
  if (!parsed.success) return;
  const admin = createAdminClient();
  if (!admin) return;
  await admin
    .from("staff_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .is("accepted_at", null);
  await recordAuditEvent({
    actorId: actor.id,
    action: "staff.invitation_revoked",
    entityType: "staff_invitations",
    entityId: parsed.data,
  });
  revalidatePath("/admin/team");
}

export async function updateStaffAction(formData: FormData) {
  const actor = await requireAdmin("/admin/team");
  const parsed = staffUpdateSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
    mfaRequired: formData.get("mfa_required") === "on",
  });
  if (!parsed.success) return;
  if (parsed.data.id === actor.id && parsed.data.role !== "admin") return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase
    .from("profiles")
    .update({
      role: parsed.data.role,
      mfa_required: parsed.data.mfaRequired,
    })
    .eq("id", parsed.data.id);
  await recordAuditEvent({
    actorId: actor.id,
    action: "staff.updated",
    entityType: "profiles",
    entityId: parsed.data.id,
    metadata: {
      role: parsed.data.role,
      mfaRequired: parsed.data.mfaRequired,
    },
  });
  revalidatePath("/admin/team");
}
