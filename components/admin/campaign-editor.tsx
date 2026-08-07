"use client";

import { Eye, Save, Send } from "lucide-react";
import { useActionState, useState } from "react";

import { Markdown } from "@/components/article/markdown";
import {
  createCampaignAction,
  updateCampaignAction,
} from "@/lib/actions/campaigns";
import { initialActionState } from "@/lib/actions/state";

type Campaign = {
  id: string;
  subject: string;
  preheader: string | null;
  content_markdown: string;
  target_topic_slugs: string[];
  target_frequency: "weekly" | "monthly" | null;
  scheduled_at: string | null;
  status: string;
};

const toLocalDate = (value: string | null | undefined) =>
  value
    ? new Date(new Date(value).getTime() + 5.5 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : "";

export function CampaignEditor({
  campaign,
  categories,
}: {
  campaign?: Campaign;
  categories: { name: string; slug: string }[];
}) {
  const selectedAction = campaign
    ? updateCampaignAction.bind(null, campaign.id)
    : createCampaignAction;
  const [state, action, pending] = useActionState(
    selectedAction,
    initialActionState,
  );
  const [content, setContent] = useState(campaign?.content_markdown ?? "");
  const [preview, setPreview] = useState(false);
  const locked = campaign?.status === "sending" || campaign?.status === "sent";
  return (
    <form action={action} className="grid max-w-4xl gap-7">
      {state.message ? (
        <p className={state.ok ? "text-accent" : "text-danger"} role="status">
          {state.message}
        </p>
      ) : null}
      {locked ? (
        <p className="border-border bg-muted rounded-lg border p-4 text-sm font-bold">
          This campaign is {campaign.status} and is now read-only.
        </p>
      ) : null}
      <section className="border-border bg-surface grid gap-5 rounded-xl border p-6">
        <h2 className="font-serif text-2xl font-semibold">Message</h2>
        <label className="grid gap-2 text-sm font-bold">
          Subject
          <input
            className="field"
            name="subject"
            defaultValue={campaign?.subject}
            maxLength={160}
            required
            disabled={locked}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Preheader
          <input
            className="field"
            name="preheader"
            defaultValue={campaign?.preheader ?? ""}
            maxLength={200}
            disabled={locked}
          />
        </label>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-bold" htmlFor="campaign-content">
              Markdown email
            </label>
            <button
              className="button-secondary"
              type="button"
              onClick={() => setPreview((value) => !value)}
            >
              <Eye aria-hidden="true" size={15} />{" "}
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="border-border bg-background min-h-80 rounded-lg border p-6">
              <Markdown content={content || "*Start writing your campaign.*"} />
            </div>
          ) : (
            <textarea
              className="field min-h-96 font-mono text-sm leading-6"
              id="campaign-content"
              name="content_markdown"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              disabled={locked}
            />
          )}
          {preview ? (
            <input type="hidden" name="content_markdown" value={content} />
          ) : null}
        </div>
      </section>
      <section className="border-border bg-surface grid gap-5 rounded-xl border p-6">
        <h2 className="font-serif text-2xl font-semibold">
          Audience & delivery
        </h2>
        <fieldset disabled={locked}>
          <legend className="text-sm font-bold">Topic segment</legend>
          <p className="text-muted-foreground mt-1 text-xs">
            No selection sends to every topic preference.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <label
                className="border-border flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm"
                key={category.slug}
              >
                <input
                  type="checkbox"
                  name="topic_slugs"
                  value={category.slug}
                  defaultChecked={campaign?.target_topic_slugs.includes(
                    category.slug,
                  )}
                />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-2 text-sm font-bold">
          Frequency segment
          <select
            className="field"
            name="target_frequency"
            defaultValue={campaign?.target_frequency ?? ""}
            disabled={locked}
          >
            <option value="">All active subscribers</option>
            <option value="weekly">Weekly subscribers</option>
            <option value="monthly">Monthly subscribers</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Schedule (IST)
          <input
            className="field"
            name="scheduled_at"
            type="datetime-local"
            defaultValue={toLocalDate(campaign?.scheduled_at)}
            disabled={locked}
          />
        </label>
        {!locked ? (
          <div className="flex flex-wrap gap-3">
            <button
              className="button-secondary"
              name="intent"
              value="draft"
              disabled={pending}
            >
              <Save aria-hidden="true" size={15} /> Save draft
            </button>
            <button
              className="button-secondary"
              name="intent"
              value="schedule"
              disabled={pending}
            >
              Schedule
            </button>
            <button
              className="button-primary"
              name="intent"
              value="send"
              disabled={pending}
            >
              <Send aria-hidden="true" size={15} /> Send next worker run
            </button>
          </div>
        ) : null}
      </section>
    </form>
  );
}
