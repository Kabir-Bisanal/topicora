import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article/article-card";
import { Disclosure } from "@/components/article/disclosure";
import { Markdown } from "@/components/article/markdown";
import { ScrollProgress } from "@/components/article/scroll-progress";
import { ShareControls } from "@/components/article/share-controls";
import { TableOfContents } from "@/components/article/table-of-contents";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import {
  getArticleBySlug,
  getArticleNavigation,
  getRelatedArticles,
} from "@/lib/db/articles";
import { demoArticles } from "@/lib/demo/articles";
import { extractTableOfContents } from "@/lib/markdown/toc";
import { absoluteUrl, articleMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/date";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return demoArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return article ? articleMetadata(article) : {};
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const [related, navigation] = await Promise.all([
    getRelatedArticles(article),
    getArticleNavigation(article),
  ]);
  const toc = extractTableOfContents(article.contentMarkdown);
  const canonical =
    article.canonicalUrl || absoluteUrl(`/articles/${article.slug}`);
  const imageUrl = absoluteUrl(article.coverImageUrl);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: canonical,
    articleSection: article.category.name,
    keywords: article.tags.map((tag) => tag.name).join(", "),
    author: {
      "@type": "Person",
      name: article.author.displayName,
      url: absoluteUrl(`/articles?author=${article.author.slug}`),
    },
    publisher: {
      "@type": "Organization",
      name: "Topicora",
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo-mark.svg") },
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category.name,
        item: absoluteUrl(`/category/${article.category.slug}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonical,
      },
    ],
  };
  return (
    <>
      <ScrollProgress />
      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd,
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: article.author.displayName,
            description: article.author.bio,
          },
        ]}
      />
      <article>
        <Container className="pt-10 sm:pt-16">
          <nav
            className="no-print text-muted-foreground mb-8 text-sm"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link> <span aria-hidden="true">/</span>{" "}
            <Link href={`/category/${article.category.slug}`}>
              {article.category.name}
            </Link>
          </nav>
          <header className="mx-auto max-w-5xl text-center">
            <Link
              className="eyebrow"
              href={`/category/${article.category.slug}`}
            >
              {article.category.name}
            </Link>
            <h1 className="headline-lg mt-5 text-balance">{article.title}</h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg leading-8 sm:text-xl">
              {article.excerpt}
            </p>
            <div className="text-muted-foreground mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              <span className="text-foreground font-bold">
                {article.author.displayName}
              </span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              {article.updatedAt !== article.publishedAt ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatDate(article.updatedAt)}</span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 aria-hidden="true" size={15} />{" "}
                {article.readingTimeMinutes} min read
              </span>
            </div>
          </header>
          <figure className="mt-10">
            <div className="bg-muted relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={article.coverImageUrl}
                alt={article.coverImageAlt}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1216px"
                className="object-cover"
              />
            </div>
            {article.coverImageCaption ? (
              <figcaption className="text-muted-foreground mt-3 text-center text-xs">
                {article.coverImageCaption}
              </figcaption>
            ) : null}
          </figure>
        </Container>

        <Container className="mt-12 grid items-start gap-10 lg:grid-cols-[15rem_minmax(0,var(--reading-width))_1fr] lg:justify-center">
          <aside className="no-print lg:sticky lg:top-24">
            <TableOfContents items={toc} />
          </aside>
          <div className="min-w-0">
            <Disclosure
              type={article.disclosure}
              note={article.disclosureNote}
            />
            <Markdown content={article.contentMarkdown} />
            <div className="no-print border-border mt-10 flex flex-wrap gap-2 border-t pt-6">
              {article.tags.map((tag) => (
                <Link
                  className="border-border bg-surface hover:bg-muted rounded-full border px-3 py-1.5 text-xs font-bold"
                  href={`/tag/${tag.slug}`}
                  key={tag.id}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <ShareControls title={article.title} url={canonical} />
            </div>
          </div>
        </Container>

        <Container className="no-print mt-16">
          <nav
            className="border-border grid gap-4 border-y py-7 sm:grid-cols-2"
            aria-label="Previous and next articles"
          >
            {navigation.newer ? (
              <Link
                className="group hover:bg-muted rounded-xl p-4"
                href={`/articles/${navigation.newer.slug}`}
              >
                <span className="eyebrow flex items-center gap-2">
                  <ArrowLeft aria-hidden="true" size={15} /> Newer
                </span>
                <span className="group-hover:text-accent mt-2 block font-serif text-xl font-semibold">
                  {navigation.newer.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {navigation.older ? (
              <Link
                className="group hover:bg-muted rounded-xl p-4 text-right"
                href={`/articles/${navigation.older.slug}`}
              >
                <span className="eyebrow flex items-center justify-end gap-2">
                  Older <ArrowRight aria-hidden="true" size={15} />
                </span>
                <span className="group-hover:text-accent mt-2 block font-serif text-xl font-semibold">
                  {navigation.older.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </Container>
      </article>

      {related.length ? (
        <section
          className="no-print border-border bg-surface mt-18 border-t py-16"
          aria-labelledby="related-heading"
        >
          <Container>
            <p className="eyebrow">Keep exploring</p>
            <h2 className="headline-md mt-2" id="related-heading">
              Related articles
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((item) => (
                <ArticleCard article={item} key={item.id} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
