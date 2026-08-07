import type { Metadata } from "next";

import { ArticleCard } from "@/components/article/article-card";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { getPublishedArticles } from "@/lib/db/articles";

export const metadata: Metadata = {
  title: "Article archive",
  description:
    "Browse every published Topicora article across technology, money, culture, everyday life, and practical guides.",
  alternates: { canonical: "/articles" },
};

export const revalidate = 300;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const pageSize = 9;
  const { articles, total } = await getPublishedArticles({ page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <Container className="py-12 sm:py-18">
      <header className="mb-12 max-w-3xl">
        <p className="eyebrow">Topicora archive</p>
        <h1 className="headline-lg mt-3">Every useful idea, in one place.</h1>
        <p className="text-muted-foreground mt-5 text-lg leading-8">
          Browse the complete publication, ordered from newest to oldest.
        </p>
      </header>
      {articles.length ? (
        <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              article={article}
              priority={index < 3}
              key={article.id}
            />
          ))}
        </div>
      ) : (
        <div className="border-border bg-surface rounded-xl border p-10 text-center">
          <h2 className="font-serif text-2xl font-semibold">
            No articles on this page
          </h2>
          <p className="text-muted-foreground mt-2">
            Try returning to the first page of the archive.
          </p>
        </div>
      )}
      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        path="/articles"
      />
    </Container>
  );
}
