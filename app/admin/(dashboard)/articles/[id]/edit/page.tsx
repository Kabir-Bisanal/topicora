import { notFound } from "next/navigation";

import { ArticleEditor } from "@/components/admin/article-editor";
import { getAdminArticle, getAdminTaxonomy } from "@/lib/db/admin";

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const [article, taxonomy, query] = await Promise.all([getAdminArticle(id), getAdminTaxonomy(), searchParams]);
  if (!article) notFound();
  return <div>{query.saved ? <p className="mb-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm font-bold text-accent" role="status">Article saved successfully.</p> : null}<ArticleEditor article={article} categories={taxonomy.categories} tags={taxonomy.tags} /></div>;
}
