"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";

import { inviteStaffAction } from "@/lib/actions/team";
import { initialActionState } from "@/lib/actions/state";

export function StaffInviteForm() {
  const [state, action, pending] = useActionState(
    inviteStaffAction,
    initialActionState,
  );
  return (
    <form
      action={action}
      className="border-border bg-surface grid gap-4 rounded-xl border p-6"
    >
      <div>
        <h2 className="font-serif text-2xl font-semibold">Invite a teammate</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Invited staff must enroll an authenticator before entering the CMS.
        </p>
      </div>
      {state.message ? (
        <p
          className={state.ok ? "text-accent text-sm" : "text-danger text-sm"}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <label className="grid gap-2 text-sm font-bold">
        Display name
        <input className="field" name="display_name" required maxLength={100} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Email
        <input className="field" name="email" type="email" required />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Role
        <select className="field" name="role" defaultValue="editor">
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="admin">Administrator</option>
        </select>
      </label>
      <button className="button-primary justify-self-start" disabled={pending}>
        <Send aria-hidden="true" size={16} />
        {pending ? "Sending…" : "Send invitation"}
      </button>
    </form>
  );
}
