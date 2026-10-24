import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import {
  demoArticles,
  demoAuthor,
  demoCategories,
  demoTags,
  type DemoArticle,
  type DemoCategory,
  type DemoTag,
} from "@/lib/demo/articles";
import { getPublicSupabase } from "@/lib/supabase/public";
import { normalizeSearchQuery } from "@/lib/validation/search";

export type PublicArticle = DemoArticle & {
  author: typeof demoAuthor;
};

export type ArticleList = { articles: PublicArticle[]; total: number };
export type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  resultExcerpt: string;
  publishedAt: string;
  categoryName: string;
  categorySlug: string;
  rank: number;
};

const asPublicArticle = (article: DemoArticle): PublicArticle => ({
  ...article,
  author: demoAuthor,
});

type ArticleRow = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown?: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_caption: string | null;
  disclosure: DemoArticle["disclosure"];
  disclosure_note: string | null;
  is_featured: boolean;
  published_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  reading_time_minutes: number;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    sort_order: number;
  };
  author: {
    id: string;
    display_name: string;
    slug: string;
    bio: string | null;
  };
  article_tags: { tag: DemoTag }[];
};

function mapArticle(row: ArticleRow): PublicArticle {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    contentMarkdown: row.content_markdown ?? "",
    category: {
      id: row.category.id,
      name: row.category.name,
      slug: row.category.slug,
      description: row.category.description,
      sortOrder: row.category.sort_order,
    },
    tags: row.article_tags ? row.article_tags.map(({ tag }) => tag).filter(Boolean) : [],
    coverImageUrl: row.cover_image_url ?? "/demo/ai-search.svg",
    coverImageAlt: row.cover_image_alt ?? "Topicora article cover",
    coverImageCaption: row.cover_image_caption ?? "",
    disclosure: row.disclosure,
    disclosureNote: row.disclosure_note,
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    seoTitle: row.seo_title ?? row.title,
    seoDescription: row.seo_description ?? row.excerpt,
    canonicalUrl: row.canonical_url,
    readingTimeMinutes: row.reading_time_minutes,
    author: {
      id: row.author.id,
      displayName: row.author.display_name,
      slug: row.author.slug,
      bio: row.author.bio ?? demoAuthor.bio,
    },
  };
}

function filterDemo(categorySlug?: string, tagSlug?: string) {
  return demoArticles
    .map(asPublicArticle)
    .filter(
      (article) => !categorySlug || article.category.slug === categorySlug,
    )
    .filter(
      (article) => !tagSlug || article.tags.some((tag) => tag.slug === tagSlug),
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

// Lightweight select for listings, cards, and navigation (avoids transferring megabytes of markdown text)
const articleCardSelect = `
  id, author_id, title, slug, excerpt, cover_image_url,
  cover_image_alt, cover_image_caption, disclosure, disclosure_note,
  is_featured, published_at, updated_at, seo_title, seo_description,
  reading_time_minutes, canonical_url,
  category:categories!articles_category_id_fkey(id,name,slug,description,sort_order),
  author:profiles!articles_author_id_fkey(id,display_name,slug,bio),
  article_tags(tag:tags(id,name,slug))
`;

// Full select used only for reading a full single article
const articleDetailSelect = `
  id, author_id, title, slug, excerpt, content_markdown, cover_image_url,
  cover_image_alt, cover_image_caption, disclosure, disclosure_note,
  is_featured, published_at, updated_at, seo_title, seo_description,
  reading_time_minutes, canonical_url,
  category:categories!articles_category_id_fkey(id,name,slug,description,sort_order),
  author:profiles!articles_author_id_fkey(id,display_name,slug,bio),
  article_tags(tag:tags(id,name,slug))
`;

async function executeGetPublishedArticles(options: {
  page: number;
  pageSize: number;
  categorySlug?: string;
  tagSlug?: string;
}): Promise<ArticleList> {
  const { page, pageSize, categorySlug, tagSlug } = options;
  const fallback = filterDemo(categorySlug, tagSlug);
  const supabase = getPublicSupabase();
  if (!supabase) {
    return {
      articles: fallback.slice((page - 1) * pageSize, page * pageSize),
      total: fallback.length,
    };
  }

  try {
    let categoryId: string | undefined;
    if (categorySlug) {
      const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();
      categoryId = data?.id;
      if (!categoryId) return { articles: [], total: 0 };
    }

    let taggedArticleIds: string[] | undefined;
    if (tagSlug) {
      const { data: tag } = await supabase
        .from("tags")
        .select("id")
        .eq("slug", tagSlug)
        .maybeSingle();
      if (!tag) return { articles: [], total: 0 };
      const { data: links } = await supabase
        .from("article_tags")
        .select("article_id")
        .eq("tag_id", tag.id);
      taggedArticleIds = links?.map((link) => link.article_id) ?? [];
      if (!taggedArticleIds.length) return { articles: [], total: 0 };
    }

    let query = supabase
      .from("articles")
      .select(articleCardSelect, { count: "exact" })
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (taggedArticleIds) query = query.in("id", taggedArticleIds);

    const { data, count, error } = await query;
    if (error || !data) throw error;
    return {
      articles: (data as unknown as ArticleRow[]).map(mapArticle),
      total: count ?? 0,
    };
  } catch {
    return {
      articles: fallback.slice((page - 1) * pageSize, page * pageSize),
      total: fallback.length,
    };
  }
}

export async function getPublishedArticles(
  options: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    tagSlug?: string;
  } = {},
): Promise<ArticleList> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 12));
  const categorySlug = options.categorySlug ?? "";
  const tagSlug = options.tagSlug ?? "";

  const cachedFetch = unstable_cache(
    async (p: number, ps: number, cSlug: string, tSlug: string) => {
      return executeGetPublishedArticles({
        page: p,
        pageSize: ps,
        categorySlug: cSlug || undefined,
        tagSlug: tSlug || undefined,
      });
    },
    ["published-articles-list"],
    { revalidate: 60, tags: ["articles"] },
  );

  return cachedFetch(page, pageSize, categorySlug, tagSlug);
}

export const getArticleBySlug = cache(async (slug: string) => {
  const cachedFetch = unstable_cache(
    async (s: string) => {
      const fallback = demoArticles.find((article) => article.slug === s);
      const supabase = getPublicSupabase();
      if (!supabase) return fallback ? asPublicArticle(fallback) : null;

      try {
        const { data, error } = await supabase
          .from("articles")
          .select(articleDetailSelect)
          .eq("slug", s)
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .maybeSingle();
        if (error) throw error;
        return data ? mapArticle(data as unknown as ArticleRow) : null;
      } catch {
        return fallback ? asPublicArticle(fallback) : null;
      }
    },
    ["article-detail-by-slug"],
    { revalidate: 300, tags: ["articles", `article-${slug}`] },
  );

  return cachedFetch(slug);
});

export const getAllCategories = unstable_cache(
  async (): Promise<DemoCategory[]> => {
    const supabase = getPublicSupabase();
    if (!supabase) return demoCategories;
    const { data } = await supabase
      .from("categories")
      .select("id,name,slug,description,sort_order")
      .order("sort_order");
    return data?.length
      ? data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          sortOrder: item.sort_order,
        }))
      : demoCategories;
  },
  ["public-all-categories"],
  { revalidate: 3600, tags: ["categories"] },
);

export const getAllTags = unstable_cache(
  async (): Promise<DemoTag[]> => {
    const supabase = getPublicSupabase();
    if (!supabase) return demoTags;
    const { data } = await supabase
      .from("tags")
      .select("id,name,slug")
      .order("name");
    return data?.length ? data : demoTags;
  },
  ["public-all-tags"],
  { revalidate: 3600, tags: ["tags"] },
);

export async function getFeaturedArticle() {
  const { articles } = await getPublishedArticles({ pageSize: 12 });
  return articles.find((article) => article.isFeatured) ?? articles[0] ?? null;
}

export async function getRelatedArticles(article: PublicArticle) {
  const { articles } = await getPublishedArticles({ pageSize: 30 });
  return articles
    .filter((candidate) => candidate.id !== article.id)
    .map((candidate) => ({
      article: candidate,
      score:
        (candidate.category.id === article.category.id ? 3 : 0) +
        candidate.tags.filter((tag) =>
          article.tags.some((item) => item.id === tag.id),
        ).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ article: candidate }) => candidate);
}

export async function getArticleNavigation(article: PublicArticle) {
  const { articles } = await getPublishedArticles({ pageSize: 50 });
  const index = articles.findIndex((candidate) => candidate.id === article.id);
  return {
    newer: index > 0 ? articles[index - 1] : null,
    older:
      index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export async function searchPublishedArticles(
  query: string,
  categorySlug?: string,
): Promise<SearchResult[]> {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [];
  const supabase = getPublicSupabase();

  if (supabase) {
    const { data, error } = await supabase.rpc("search_published_articles", {
      search_query: normalized,
      category_filter: categorySlug || undefined,
      result_limit: 20,
      result_offset: 0,
    });
    if (!error && data) {
      return (data as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        title: String(row.title),
        slug: String(row.slug),
        excerpt: String(row.excerpt),
        resultExcerpt: String(row.result_excerpt),
        publishedAt: String(row.published_at),
        categoryName: String(row.category_name),
        categorySlug: String(row.category_slug),
        rank: Number(row.rank),
      }));
    }
  }

  const terms = normalized.toLowerCase().split(/\s+/).filter(Boolean);
  return filterDemo(categorySlug)
    .filter((article) => {
      const haystack =
        `${article.title} ${article.excerpt} ${article.contentMarkdown}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      resultExcerpt: article.excerpt,
      publishedAt: article.publishedAt,
      categoryName: article.category.name,
      categorySlug: article.category.slug,
      rank: 1,
    }));
}
