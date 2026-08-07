"use client";

import { useState, type FormEvent } from "react";

import { BotFields } from "@/components/forms/bot-fields";

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setMessage("");
    const form = event.currentTarget; const data = new FormData(form);
    const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), consent: data.get("consent") === "on", consentText: data.get("consent_text"), source: "footer", website: data.get("website"), startedAt: data.get("startedAt") }) });
    const result = await response.json() as { message?: string };
    setMessage(result.message ?? "Please try again shortly."); setPending(false); if (response.ok) form.reset();
  };
  return <form className="relative grid gap-3" onSubmit={submit}><BotFields /><label><span className="sr-only">Email address</span><input className="field" type="email" name="email" placeholder="you@example.com" autoComplete="email" required /></label><label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input className="mt-1" type="checkbox" name="consent" required /><span>I agree to receive Topicora’s newsletter and can unsubscribe at any time.</span></label><input type="hidden" name="consent_text" value="I agree to receive Topicora’s newsletter and can unsubscribe at any time." /><button className="button-primary" type="submit" disabled={pending}>{pending ? "Joining…" : "Join the newsletter"}</button><p className="min-h-5 text-xs text-muted-foreground" aria-live="polite">{message}</p></form>;
}
