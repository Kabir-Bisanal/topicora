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
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Editorial operations</p><h1 className="headline-md mt-2">Dashboard</h1><p className="mt-3 text-muted-foreground">A clear view of what needs attention today.</p></div><Link className="button-primary" href="/admin/articles/new">Create article <ArrowRight aria-hidden="true" size={16} /></Link></div><section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Publication summary">{cards.map(([label, value, Icon, href]) => <Link className="rounded-xl border border-border bg-surface p-5 hover:bg-muted" href={href} key={label}><Icon className="text-accent" aria-hidden="true" size={22} /><p className="mt-6 text-4xl font-bold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></Link>)}</section><section className="mt-8 rounded-xl border border-border bg-surface p-6"><h2 className="font-serif text-2xl font-semibold">Editorial queue</h2><p className="mt-2 text-sm text-muted-foreground">{summary.drafts ? `${summary.drafts} draft${summary.drafts === 1 ? " is" : "s are"} ready for review.` : "No drafts are waiting. Start a new article when the next idea is ready."}</p><Link className="button-secondary mt-5" href="/admin/articles">Review articles</Link></section></div>;
}
