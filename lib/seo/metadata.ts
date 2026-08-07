import type { Metadata } from "next";

import type { PublicArticle } from "@/lib/db/articles";
import { publicEnv } from "@/lib/env/public";

export function absoluteUrl(path = "/") {
  return new URL(path, publicEnv.NEXT_PUBLIC_SITE_URL).toString();
}

export function articleMetadata(article: PublicArticle): Metadata {
  const canonical = article.canonicalUrl || absoluteUrl(`/articles/${article.slug}`);
  const image = absoluteUrl(`/articles/${article.slug}/opengraph-image`);
  return {
    title: article.seoTitle,
    description: article.seoDescription,
    alternates: { canonical },
    authors: [{ name: article.author.displayName }],
    category: article.category.name,
    keywords: article.tags.map((tag) => tag.name),
    openGraph: {
      type: "article",
      title: article.seoTitle,
      description: article.seoDescription,
      url: canonical,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.displayName],
      section: article.category.name,
      tags: article.tags.map((tag) => tag.name),
      images: [{ url: image, width: 1200, height: 630, alt: article.coverImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.seoDescription,
      images: [image],
    },
  };
}
