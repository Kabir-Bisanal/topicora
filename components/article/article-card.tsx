import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PublicArticle } from "@/lib/db/articles";
import { formatDate } from "@/lib/utils/date";

export function ArticleCard({ article, priority = false }: { article: PublicArticle; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`} className="block overflow-hidden rounded-xl bg-muted">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </div>
      </Link>
      <div className="mt-4">
        <Link className="eyebrow" href={`/category/${article.category.slug}`}>{article.category.name}</Link>
        <h2 className="mt-2 font-serif text-[1.7rem] leading-[1.08] font-semibold tracking-[-0.025em]">
          <Link className="decoration-accent decoration-2 underline-offset-4 group-hover:underline" href={`/articles/${article.slug}`}>
            {article.title} <ArrowUpRight className="inline" aria-hidden="true" size={18} />
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          {formatDate(article.publishedAt)} · {article.readingTimeMinutes} min read
        </p>
      </div>
    </article>
  );
}
