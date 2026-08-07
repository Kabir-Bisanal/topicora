import { ShieldCheck } from "lucide-react";

import { StaffInviteForm } from "@/components/admin/staff-invite-form";
import { revokeInvitationAction, updateStaffAction } from "@/lib/actions/team";
import { requireAdmin } from "@/lib/auth/server";
import { getStaffDirectory } from "@/lib/db/admin";
import { formatDate } from "@/lib/utils/date";

export default async function TeamPage() {
  await requireAdmin("/admin/team");
  const { profiles, invitations } = await getStaffDirectory();
  return (
    <div>
      <p className="eyebrow">Access control</p>
      <h1 className="headline-md mt-2">Team & invitations</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        Manage editorial roles and require MFA. Role and security changes are
        recorded in the immutable audit trail.
      </p>
      <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-start gap-7">
          <section className="border-border bg-surface overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-border bg-muted border-b text-left">
                <tr>
                  <th className="p-4">Staff member</th>
                  <th className="p-4" colSpan={2}>
                    Access controls
                  </th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="p-4 font-bold">{profile.display_name}</td>
                    <td className="p-4" colSpan={3}>
                      <form
                        action={updateStaffAction}
                        className="flex items-center gap-3"
                      >
                        <input type="hidden" name="id" value={profile.id} />
                        <select
                          className="field min-h-10 w-36"
                          name="role"
                          defaultValue={profile.role}
                        >
                          <option value="admin">Administrator</option>
                          <option value="editor">Editor</option>
                          <option value="author">Author</option>
                        </select>
                        <label className="flex min-h-10 items-center gap-2">
                          <input
                            type="checkbox"
                            name="mfa_required"
                            defaultChecked={profile.mfa_required}
                          />
                          <ShieldCheck aria-hidden="true" size={16} /> Required
                        </label>
                        <button className="button-secondary" type="submit">
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section>
            <h2 className="font-serif text-2xl font-semibold">
              Invitation history
            </h2>
            <div className="border-border bg-surface mt-4 divide-y rounded-xl border">
              {invitations.map((invite) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                  key={invite.id}
                >
                  <div>
                    <p className="font-bold">{invite.display_name}</p>
                    <p className="text-muted-foreground text-sm">
                      {invite.email} · {invite.role}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Invited {formatDate(invite.created_at)}
                    </p>
                  </div>
                  {invite.accepted_at ? (
                    <span className="text-accent text-sm font-bold">
                      Accepted
                    </span>
                  ) : invite.revoked_at ? (
                    <span className="text-muted-foreground text-sm">
                      Revoked
                    </span>
                  ) : (
                    <form action={revokeInvitationAction.bind(null, invite.id)}>
                      <button className="button-ghost" type="submit">
                        Revoke
                      </button>
                    </form>
                  )}
                </div>
              ))}
              {invitations.length === 0 ? (
                <p className="text-muted-foreground p-6 text-sm">
                  No invitations have been sent.
                </p>
              ) : null}
            </div>
          </section>
        </div>
        <StaffInviteForm />
      </div>
    </div>
  );
}
