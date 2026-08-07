"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

export function InviteAcceptForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmation") ?? "");
    if (password.length < 12 || password !== confirmation) {
      setMessage("Use at least 12 characters and make both passwords match.");
      setPending(false);
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(
        "The invitation session is missing or expired. Ask an administrator for a new invitation.",
      );
      setPending(false);
      return;
    }
    await fetch("/api/staff/accept", { method: "POST" });
    router.push("/admin/security?mode=setup&next=/admin");
    router.refresh();
  };

  return (
    <form className="mt-7 grid gap-4" onSubmit={submit}>
      {message ? (
        <p className="text-danger text-sm" role="alert">
          {message}
        </p>
      ) : null}
      <label className="grid gap-2 text-sm font-bold">
        Create password
        <input
          className="field"
          name="password"
          type="password"
          minLength={12}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Confirm password
        <input
          className="field"
          name="confirmation"
          type="password"
          minLength={12}
          required
        />
      </label>
      <button className="button-primary" disabled={pending}>
        {pending ? "Activating…" : "Activate editorial account"}
      </button>
    </form>
  );
}
