import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article/article-card";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { getAllTags, getPublishedArticles } from "@/lib/db/articles";
import { demoTags } from "@/lib/demo/articles";

export const revalidate = 300;
export const dynamicParams = true;
export function generateStaticParams() {
  return demoTags.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = (await getAllTags()).find((item) => item.slug === slug);
  if (!tag) return {};
  return {
    title: `Articles tagged “${tag.name}”`,
    description: `Read Topicora articles about ${tag.name}.`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, query, tags] = await Promise.all([
    params,
    searchParams,
    getAllTags(),
  ]);
  const tag = tags.find((item) => item.slug === slug);
  if (!tag) notFound();
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const pageSize = 9;
  const { articles, total } = await getPublishedArticles({
    tagSlug: slug,
    page,
    pageSize,
  });
  return (
    <Container className="py-12 sm:py-18">
      <header className="mb-12">
        <p className="eyebrow">Topic tag</p>
        <h1 className="headline-lg mt-3">{tag.name}</h1>
        <p className="text-muted-foreground mt-4">
          Articles connected by this topic.
        </p>
      </header>
      {articles.length ? (
        <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </div>
      ) : (
        <div className="border-border bg-surface rounded-xl border p-10">
          No published articles use this tag yet.
        </div>
      )}
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / pageSize))}
        path={`/tag/${slug}`}
      />
    </Container>
  );
}
