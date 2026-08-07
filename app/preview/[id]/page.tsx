import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Disclosure } from "@/components/article/disclosure";
import { Markdown } from "@/components/article/markdown";
import { Container } from "@/components/ui/container";
import { validatePreviewToken } from "@/lib/auth/preview";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Draft preview", robots: { index: false, follow: false, noarchive: true } };
export const dynamic = "force-dynamic";

export default async function PreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!query.token || !validatePreviewToken(query.token, id)) notFound();
  const supabase = createAdminClient();
  if (!supabase) notFound();
  const { data: article } = await supabase.from("articles").select("title,excerpt,content_markdown,status,disclosure,disclosure_note,updated_at").eq("id", id).maybeSingle();
  if (!article) notFound();
  return <main className="min-h-screen"><div className="no-print sticky top-0 z-20 border-b border-border bg-foreground px-5 py-3 text-center text-sm font-bold text-background">Secure draft preview · {article.status} · <Link className="underline" href={`/admin/articles/${id}/edit`}>Return to editor</Link></div><Container className="max-w-(--reading-width) py-12"><header><p className="eyebrow">Unpublished preview</p><h1 className="headline-lg mt-4">{article.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{article.excerpt}</p></header><Disclosure type={article.disclosure} note={article.disclosure_note} /><Markdown content={article.content_markdown} /></Container></main>;
}
