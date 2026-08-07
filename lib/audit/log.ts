import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function recordAuditEvent(input: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  if (!supabase) return;
  await supabase.rpc("record_audit_event", {
    event_actor: input.actorId,
    event_action: input.action,
    event_entity_type: input.entityType,
    event_entity_id: input.entityId ?? null,
    event_metadata: input.metadata ?? {},
  });
}
