"use client";

import { useState, type FormEvent } from "react";

type Category = { name: string; slug: string };

export function NewsletterPreferencesForm({
  token,
  email,
  status,
  categories,
  selectedTopics,
  frequency,
}: {
  token: string;
  email: string;
  status: string;
  categories: Category[];
  selectedTopics: string[];
  frequency: "weekly" | "monthly";
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(status === "unsubscribed");

  const submit = async (
    event: FormEvent<HTMLFormElement>,
    action: "save" | "unsubscribe",
  ) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/newsletter/preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        action,
        topicSlugs: form.getAll("topic_slugs"),
        frequency: form.get("frequency"),
      }),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message ?? "Please try again.");
    if (response.ok && action === "unsubscribe") setUnsubscribed(true);
    setPending(false);
  };

  if (unsubscribed)
    return (
      <div className="border-border bg-surface rounded-xl border p-7">
        <h2 className="font-serif text-2xl font-semibold">
          You are unsubscribed
        </h2>
        <p className="text-muted-foreground mt-3">
          Topicora will not send more campaigns to {email}. To subscribe again,
          use the signup form and confirm your address.
        </p>
      </div>
    );

  return (
    <form
      className="border-border bg-surface grid gap-6 rounded-xl border p-6 sm:p-8"
      onSubmit={(event) => submit(event, "save")}
    >
      <div>
        <p className="text-sm font-bold">{email}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Leaving every topic unchecked means you are happy to receive all
          topics.
        </p>
      </div>
      <fieldset>
        <legend className="text-sm font-bold">Topics</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <label
              className="border-border flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm"
              key={category.slug}
            >
              <input
                type="checkbox"
                name="topic_slugs"
                value={category.slug}
                defaultChecked={selectedTopics.includes(category.slug)}
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2 text-sm font-bold">
        Delivery frequency
        <select className="field" name="frequency" defaultValue={frequency}>
          <option value="weekly">Weekly reading note</option>
          <option value="monthly">Monthly digest</option>
        </select>
      </label>
      {message ? (
        <p className="text-accent text-sm" role="status">
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button className="button-primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save preferences"}
        </button>
        <button
          className="button-ghost text-danger"
          type="button"
          disabled={pending}
          onClick={(event) => {
            const form = event.currentTarget.form;
            if (
              form &&
              window.confirm("Unsubscribe this address from Topicora?")
            )
              void submit(
                {
                  preventDefault() {},
                  currentTarget: form,
                } as FormEvent<HTMLFormElement>,
                "unsubscribe",
              );
          }}
        >
          Unsubscribe
        </button>
      </div>
    </form>
  );
}
