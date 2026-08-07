import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/article/article-card";
import { Container } from "@/components/ui/container";
import { getAllCategories, getFeaturedArticle, getPublishedArticles } from "@/lib/db/articles";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles({ pageSize: 12 }),
    getAllCategories(),
  ]);

  return (
    <>
      <Container className="py-10 sm:py-16">
        <div className="mb-10 max-w-4xl">
          <p className="eyebrow mb-5">A publication for useful curiosity</p>
          <h1 className="headline-xl">Ideas worth understanding, made practical.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Topicora explains technology, money, culture, and everyday choices with calm context and useful next steps.
          </p>
        </div>

        {featured ? (
          <article className="grid overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-[1.2fr_1fr]">
            <Link className="relative min-h-72 overflow-hidden lg:min-h-[31rem]" href={`/articles/${featured.slug}`}>
              <Image src={featured.coverImageUrl} alt={featured.coverImageAlt} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover transition-transform duration-500 hover:scale-[1.02]" />
            </Link>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <Link className="eyebrow" href={`/category/${featured.category.slug}`}>Featured · {featured.category.name}</Link>
              <h2 className="headline-md mt-4">
                <Link className="hover:text-accent" href={`/articles/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">{featured.excerpt}</p>
              <p className="mt-5 text-xs font-bold text-muted-foreground">{featured.readingTimeMinutes} min read</p>
              <Link className="button-primary mt-7 self-start" href={`/articles/${featured.slug}`}>Read the feature <ArrowRight aria-hidden="true" size={17} /></Link>
            </div>
          </article>
        ) : null}
      </Container>

      <section className="border-y border-border bg-surface py-16" aria-labelledby="latest-heading">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-5">
            <div><p className="eyebrow">Freshly published</p><h2 className="headline-md mt-2" id="latest-heading">Latest articles</h2></div>
            <Link className="button-secondary" href="/articles">View archive <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
          <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {latest.articles.filter((article) => article.id !== featured?.id).slice(0, 6).map((article) => <ArticleCard article={article} key={article.id} />)}
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-24">
        <div className="mb-9"><p className="eyebrow">Browse your way</p><h2 className="headline-md mt-2">Explore by category</h2></div>
        <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((item, index) => (
            <Link className="group min-h-52 border-r border-b border-border bg-surface p-6 transition-colors hover:bg-muted" href={`/category/${item.slug}`} key={item.id}>
              <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
              <h3 className="mt-12 font-serif text-2xl font-semibold tracking-tight group-hover:text-accent">{item.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
