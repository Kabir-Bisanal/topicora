import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HighlightedText } from "@/components/article/highlighted-text";
import { Container } from "@/components/ui/container";
import { getAllCategories, searchPublishedArticles } from "@/lib/db/articles";
import { formatDate } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Topicora article archive.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const query = q.trim().slice(0, 120);
  const [categories, results] = await Promise.all([
    getAllCategories(),
    searchPublishedArticles(query, category || undefined),
  ]);
  return (
    <Container className="py-12 sm:py-18">
      <header className="max-w-3xl">
        <p className="eyebrow">Discovery</p>
        <h1 className="headline-lg mt-3">Search Topicora</h1>
        <p className="text-muted-foreground mt-4">
          Search article titles, summaries, and full Markdown content.
        </p>
      </header>
      <form
        className="border-border bg-surface mt-9 grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_14rem_auto]"
        action="/search"
        role="search"
      >
        <label>
          <span className="sr-only">Search articles</span>
          <input
            className="field"
            type="search"
            name="q"
            minLength={2}
            maxLength={120}
            defaultValue={query}
            placeholder="Try “viral claim” or “attention”"
          />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select className="field" name="category" defaultValue={category}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button className="button-primary" type="submit">
          <Search aria-hidden="true" size={17} /> Search
        </button>
      </form>
      <section className="mt-10" aria-live="polite">
        {query.length < 2 ? (
          <div className="border-border bg-muted rounded-xl border p-8">
            <h2 className="font-serif text-2xl font-semibold">
              Start with a specific idea
            </h2>
            <p className="text-muted-foreground mt-2">
              Enter at least two characters. A phrase usually works better than
              a broad single word.
            </p>
          </div>
        ) : results.length ? (
          <>
            <p className="text-muted-foreground mb-5 text-sm">
              {results.length} result{results.length === 1 ? "" : "s"} for “
              {query}”
            </p>
            <div className="divide-border border-border divide-y border-y">
              {results.map((result) => (
                <article className="py-7" key={result.id}>
                  <Link
                    className="eyebrow"
                    href={`/category/${result.categorySlug}`}
                  >
                    {result.categoryName}
                  </Link>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                    <Link
                      className="hover:text-accent"
                      href={`/articles/${result.slug}`}
                    >
                      {result.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">
                    <HighlightedText
                      text={result.resultExcerpt || result.excerpt}
                    />
                  </p>
                  <p className="text-muted-foreground mt-3 text-xs font-semibold">
                    {formatDate(result.publishedAt)}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="border-border bg-muted rounded-xl border p-8">
            <h2 className="font-serif text-2xl font-semibold">
              No matching articles
            </h2>
            <p className="text-muted-foreground mt-2">
              Try fewer words, check the spelling, or remove the category
              filter.
            </p>
          </div>
        )}
      </section>
    </Container>
  );
}
