"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/state";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(loginAction, initialActionState);
  return (
    <form action={action} className="mt-8 grid gap-5">
      <input type="hidden" name="next" value={nextPath} />
      <label className="grid gap-2 text-sm font-bold">Email<input className="field" type="email" name="email" autoComplete="email" required /></label>
      <label className="grid gap-2 text-sm font-bold">Password<input className="field" type="password" name="password" autoComplete="current-password" minLength={8} required /></label>
      {state.message ? <p className="text-sm text-danger" role="alert">{state.message}</p> : null}
      <button className="button-primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in securely"}</button>
    </form>
  );
}
