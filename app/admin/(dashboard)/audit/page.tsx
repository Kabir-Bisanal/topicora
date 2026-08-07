import { requireAdmin } from "@/lib/auth/server";
import { getAuditLogs } from "@/lib/db/admin";
import { formatDate } from "@/lib/utils/date";

export default async function AuditPage() {
  await requireAdmin("/admin/audit");
  const events = await getAuditLogs();
  return (
    <div>
      <p className="eyebrow">Governance</p>
      <h1 className="headline-md mt-2">Audit trail</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        Append-only records of editorial, access, campaign, and security
        changes.
      </p>
      <div className="border-border bg-surface mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-border bg-muted border-b text-left">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="p-4 whitespace-nowrap">
                  {formatDate(event.created_at)}
                </td>
                <td className="p-4">{event.actor?.display_name ?? "System"}</td>
                <td className="p-4 font-mono text-xs">{event.action}</td>
                <td className="p-4">
                  {event.entity_type}
                  {event.entity_id ? ` · ${event.entity_id.slice(0, 12)}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
