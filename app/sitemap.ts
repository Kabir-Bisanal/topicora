import type { MetadataRoute } from "next";

import { getAllCategories, getAllTags, getPublishedArticles } from "@/lib/db/articles";
import { absoluteUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ articles }, categories, tags] = await Promise.all([getPublishedArticles({ pageSize: 50 }), getAllCategories(), getAllTags()]);
  const staticPaths = ["", "/articles", "/about", "/contact", "/privacy", "/terms", "/disclaimer", "/editorial-policy", "/corrections-policy", "/ai-assistance-policy"];
  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path || "/"), lastModified: new Date(), changeFrequency: path === "" ? "daily" as const : "monthly" as const, priority: path === "" ? 1 : path === "/articles" ? 0.9 : 0.5 })),
    ...categories.map((item) => ({ url: absoluteUrl(`/category/${item.slug}`), lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...tags.map((item) => ({ url: absoluteUrl(`/tag/${item.slug}`), lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...articles.map((article) => ({ url: absoluteUrl(`/articles/${article.slug}`), lastModified: new Date(article.updatedAt), changeFrequency: "monthly" as const, priority: article.isFeatured ? 0.9 : 0.8 })),
  ];
}
