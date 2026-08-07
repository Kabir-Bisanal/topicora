import { MailPlus } from "lucide-react";
import Link from "next/link";

import { cancelCampaignAction } from "@/lib/actions/campaigns";
import { requireAdmin } from "@/lib/auth/server";
import { getCampaigns } from "@/lib/db/admin";
import { formatDate } from "@/lib/utils/date";

export default async function CampaignsPage() {
  await requireAdmin("/admin/campaigns");
  const campaigns = await getCampaigns();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Audience publishing</p>
          <h1 className="headline-md mt-2">Newsletter campaigns</h1>
          <p className="text-muted-foreground mt-3">
            Segment, schedule, deliver, and audit editorial email.
          </p>
        </div>
        <Link className="button-primary" href="/admin/campaigns/new">
          <MailPlus aria-hidden="true" size={16} /> New campaign
        </Link>
      </div>
      <div className="border-border bg-surface mt-8 divide-y rounded-xl border">
        {campaigns.map((campaign) => (
          <article
            className="flex flex-wrap items-center justify-between gap-4 p-5"
            key={campaign.id}
          >
            <div>
              <Link
                className="font-serif text-xl font-semibold hover:underline"
                href={`/admin/campaigns/${campaign.id}/edit`}
              >
                {campaign.subject}
              </Link>
              <p className="text-muted-foreground mt-1 text-xs">
                {campaign.status === "sent" && campaign.sent_at
                  ? `Sent ${formatDate(campaign.sent_at)}`
                  : campaign.scheduled_at
                    ? `Scheduled ${formatDate(campaign.scheduled_at)}`
                    : `Updated ${formatDate(campaign.updated_at)}`}
                {" · "}
                {campaign.target_frequency ?? "all frequencies"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="border-border rounded-full border px-3 py-1 text-xs font-bold capitalize">
                {campaign.status}
              </span>
              {campaign.status === "draft" ||
              campaign.status === "scheduled" ? (
                <form action={cancelCampaignAction.bind(null, campaign.id)}>
                  <button className="button-ghost" type="submit">
                    Cancel
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center">
            No campaigns yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
