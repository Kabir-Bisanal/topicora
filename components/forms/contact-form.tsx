"use client";

import { useState, type FormEvent } from "react";

import { BotFields } from "@/components/forms/bot-fields";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        reason: data.get("reason"),
        articleUrl: data.get("article_url"),
        subject: data.get("subject"),
        message: data.get("message"),
        website: data.get("website"),
        startedAt: data.get("startedAt"),
      }),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message ?? "Please try again shortly.");
    setPending(false);
    if (response.ok) form.reset();
  };
  return (
    <form
      className="border-border bg-surface relative grid gap-5 rounded-xl border p-5 sm:p-7"
      onSubmit={submit}
    >
      <BotFields />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Name
          <input
            className="field"
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            className="field"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Reason
        <select className="field" name="reason" required>
          <option value="general feedback">General feedback</option>
          <option value="correction">Correction</option>
          <option value="business enquiry">Business enquiry</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Related article URL{" "}
        <span className="text-muted-foreground font-normal">(optional)</span>
        <input
          className="field"
          type="url"
          name="article_url"
          placeholder="https://topicora.com/articles/…"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Subject
        <input
          className="field"
          name="subject"
          minLength={5}
          maxLength={160}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Message
        <textarea
          className="field min-h-44"
          name="message"
          minLength={20}
          maxLength={5000}
          required
        />
      </label>
      <button
        className="button-primary justify-self-start"
        type="submit"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send message"}
      </button>
      <p
        className="text-muted-foreground min-h-6 text-sm"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}
