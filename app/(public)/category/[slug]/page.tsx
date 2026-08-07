import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article/article-card";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { getAllCategories, getPublishedArticles } from "@/lib/db/articles";
import { demoCategories } from "@/lib/demo/articles";

export const revalidate = 300;
export const dynamicParams = true;
export function generateStaticParams() {
  return demoCategories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getAllCategories()).find(
    (item) => item.slug === slug,
  );
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, query, categories] = await Promise.all([
    params,
    searchParams,
    getAllCategories(),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const pageSize = 9;
  const { articles, total } = await getPublishedArticles({
    categorySlug: slug,
    page,
    pageSize,
  });
  return (
    <Container className="py-12 sm:py-18">
      <header className="mb-12 max-w-3xl">
        <p className="eyebrow">Category</p>
        <h1 className="headline-lg mt-3">{category.name}</h1>
        <p className="text-muted-foreground mt-5 text-lg leading-8">
          {category.description}
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
          <h2 className="font-serif text-2xl font-semibold">
            Nothing published here yet
          </h2>
          <p className="text-muted-foreground mt-2">
            This category is ready for its first article.
          </p>
        </div>
      )}
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / pageSize))}
        path={`/category/${slug}`}
      />
    </Container>
  );
}
