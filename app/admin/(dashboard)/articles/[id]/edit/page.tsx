import { notFound } from "next/navigation";

import { ArticleEditor } from "@/components/admin/article-editor";
import { ArticleRevisionHistory } from "@/components/admin/article-revision-history";
import {
  getAdminArticle,
  getAdminTaxonomy,
  getArticleRevisions,
} from "@/lib/db/admin";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const [article, taxonomy, query, revisions] = await Promise.all([
    getAdminArticle(id),
    getAdminTaxonomy(),
    searchParams,
    getArticleRevisions(id),
  ]);
  if (!article) notFound();
  return (
    <div>
      {query.saved ? (
        <p
          className="border-accent/30 bg-accent/10 text-accent mb-4 rounded-lg border p-3 text-sm font-bold"
          role="status"
        >
          Article saved successfully.
        </p>
      ) : null}
      <ArticleEditor
        article={article}
        categories={taxonomy.categories}
        tags={taxonomy.tags}
      />
      <ArticleRevisionHistory articleId={id} revisions={revisions} />
    </div>
  );
}
