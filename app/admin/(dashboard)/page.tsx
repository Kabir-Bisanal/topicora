import { ArrowRight, FileText, Inbox, Newspaper, Users } from "lucide-react";
import Link from "next/link";

import { getAdminDashboard } from "@/lib/db/admin";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboard();
  const cards = [
    ["All articles", summary.articles, FileText, "/admin/articles"],
    ["Published", summary.published, Newspaper, "/admin/articles"],
    ["New messages", summary.messages, Inbox, "/admin/messages"],
    ["Active subscribers", summary.subscribers, Users, "/admin/subscribers"],
  ] as const;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Editorial operations</p>
          <h1 className="headline-md mt-2">Dashboard</h1>
          <p className="text-muted-foreground mt-3">
            A clear view of what needs attention today.
          </p>
        </div>
        <Link className="button-primary" href="/admin/articles/new">
          Create article <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <section
        className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Publication summary"
      >
        {cards.map(([label, value, Icon, href]) => (
          <Link
            className="border-border bg-surface hover:bg-muted rounded-xl border p-5"
            href={href}
            key={label}
          >
            <Icon className="text-accent" aria-hidden="true" size={22} />
            <p className="mt-6 text-4xl font-bold">{value}</p>
            <p className="text-muted-foreground mt-1 text-sm">{label}</p>
          </Link>
        ))}
      </section>
      <section className="border-border bg-surface mt-8 rounded-xl border p-6">
        <h2 className="font-serif text-2xl font-semibold">Editorial queue</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {summary.drafts
            ? `${summary.drafts} draft${summary.drafts === 1 ? " is" : "s are"} ready for review.`
            : "No drafts are waiting. Start a new article when the next idea is ready."}
        </p>
        <Link className="button-secondary mt-5" href="/admin/articles">
          Review articles
        </Link>
      </section>
    </div>
  );
}
