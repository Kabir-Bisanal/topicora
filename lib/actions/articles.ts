"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { calculateReadingTime } from "@/lib/article/reading-time";
import { requireAdmin, requireStaff } from "@/lib/auth/server";
import type { ActionState } from "@/lib/actions/state";
import { fieldErrors } from "@/lib/actions/state";
import { createClient } from "@/lib/supabase/server";
import { articleIdSchema, articleInputSchema, type ArticleInput } from "@/lib/validation/article";

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["image/gif", "gif"],
]);

function optional(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function publicationDate(value: FormDataEntryValue | null, status: string) {
  const normalized = String(value ?? "").trim();
  if (!normalized && status === "published") return new Date().toISOString();
  if (!normalized) return null;
  const withZone = /(?:Z|[+-]\d\d:\d\d)$/.test(normalized) ? normalized : `${normalized}:00+05:30`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? "invalid" : date.toISOString();
}

function parseArticle(formData: FormData) {
  const status = String(formData.get("status") ?? "draft");
  return articleInputSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    contentMarkdown: formData.get("content_markdown"),
    categoryId: formData.get("category_id"),
    tagIds: formData.getAll("tag_ids").map(String),
    status,
    disclosure: formData.get("disclosure"),
    disclosureNote: optional(formData.get("disclosure_note")),
    isFeatured: formData.get("is_featured") === "on",
    publishedAt: publicationDate(formData.get("published_at"), status),
    seoTitle: optional(formData.get("seo_title")),
    seoDescription: optional(formData.get("seo_description")),
    canonicalUrl: optional(formData.get("canonical_url")),
    coverImageAlt: optional(formData.get("cover_image_alt")),
    coverImageCaption: optional(formData.get("cover_image_caption")),
    existingCoverImageUrl: optional(formData.get("existing_cover_image_url")),
  });
}

async function uploadCover(articleId: string, file: File, supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>) {
  if (!file.size) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error("The cover image must be 5 MB or smaller.");
  const extension = imageTypes.get(file.type);
  if (!extension) throw new Error("Use a JPEG, PNG, WebP, AVIF, or GIF image. SVG uploads are rejected.");
  const path = `${articleId}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("article-media").upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
  if (error) throw new Error("The image could not be uploaded.");
  return supabase.storage.from("article-media").getPublicUrl(path).data.publicUrl;
}

function articleRecord(input: ArticleInput, authorId: string, coverImageUrl: string | null) {
  return {
    author_id: authorId,
    category_id: input.categoryId,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content_markdown: input.contentMarkdown,
    cover_image_url: coverImageUrl,
    cover_image_alt: input.coverImageAlt,
    cover_image_caption: input.coverImageCaption,
    status: input.status,
    disclosure: input.disclosure,
    disclosure_note: input.disclosureNote,
    is_featured: input.isFeatured,
    published_at: input.publishedAt,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    canonical_url: input.canonicalUrl,
    reading_time_minutes: calculateReadingTime(input.contentMarkdown),
  };
}

async function saveTags(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, articleId: string, tagIds: string[]) {
  await supabase.from("article_tags").delete().eq("article_id", articleId);
  if (tagIds.length) {
    const { error } = await supabase.from("article_tags").insert(tagIds.map((tagId) => ({ article_id: articleId, tag_id: tagId })));
    if (error) throw error;
  }
}

function refreshPublic(slug: string) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
}

export async function createArticleAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireStaff("/admin/articles/new");
  const parsed = parseArticle(formData);
  if (!parsed.success) return fieldErrors(parsed.error);
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };
  const { data: duplicate } = await supabase.from("articles").select("id").eq("slug", parsed.data.slug).maybeSingle();
  if (duplicate) return { ok: false, message: "That slug is already in use.", errors: { slug: ["Choose a unique slug."] } };

  const id = randomUUID();
  let coverUrl = parsed.data.existingCoverImageUrl;
  try {
    const file = formData.get("cover_image");
    if (file instanceof File && file.size) {
      if (!parsed.data.coverImageAlt) return { ok: false, message: "Add cover-image alt text before uploading." };
      coverUrl = await uploadCover(id, file, supabase);
    }
    if (parsed.data.isFeatured) await supabase.from("articles").update({ is_featured: false }).eq("is_featured", true);
    const { error } = await supabase.from("articles").insert({ id, ...articleRecord(parsed.data, profile.id, coverUrl) });
    if (error) return { ok: false, message: error.code === "23505" ? "The slug or featured selection conflicts with another article." : "The article could not be created." };
    await saveTags(supabase, id, parsed.data.tagIds);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "The article could not be created." };
  }
  refreshPublic(parsed.data.slug);
  redirect(`/admin/articles/${id}/edit?saved=1`);
}

export async function updateArticleAction(id: string, _state: ActionState, formData: FormData): Promise<ActionState> {
  const parsedId = articleIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: "Invalid article identifier." };
  await requireStaff(`/admin/articles/${id}/edit`);
  const parsed = parseArticle(formData);
  if (!parsed.success) return fieldErrors(parsed.error);
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured." };
  const { data: current } = await supabase.from("articles").select("author_id,slug,cover_image_url").eq("id", id).maybeSingle();
  if (!current) return { ok: false, message: "The article no longer exists." };
  const { data: duplicate } = await supabase.from("articles").select("id").eq("slug", parsed.data.slug).neq("id", id).maybeSingle();
  if (duplicate) return { ok: false, message: "That slug is already in use.", errors: { slug: ["Choose a unique slug."] } };

  let coverUrl = parsed.data.existingCoverImageUrl ?? current.cover_image_url;
  try {
    const file = formData.get("cover_image");
    if (file instanceof File && file.size) {
      if (!parsed.data.coverImageAlt) return { ok: false, message: "Add cover-image alt text before uploading." };
      coverUrl = await uploadCover(id, file, supabase);
    }
    if (coverUrl && !parsed.data.coverImageAlt) return { ok: false, message: "Cover-image alt text is required." };
    if (parsed.data.isFeatured) await supabase.from("articles").update({ is_featured: false }).eq("is_featured", true).neq("id", id);
    const { error } = await supabase.from("articles").update(articleRecord(parsed.data, current.author_id, coverUrl)).eq("id", id);
    if (error) return { ok: false, message: error.code === "23505" ? "The slug or featured selection conflicts with another article." : "The article could not be saved." };
    await saveTags(supabase, id, parsed.data.tagIds);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "The article could not be saved." };
  }
  refreshPublic(current.slug);
  refreshPublic(parsed.data.slug);
  redirect(`/admin/articles/${id}/edit?saved=1`);
}

export async function changeArticleStatusAction(id: string, status: "draft" | "published" | "archived", _formData: FormData) {
  void _formData;
  articleIdSchema.parse(id);
  await requireStaff("/admin/articles");
  const supabase = await createClient();
  if (!supabase) return;
  const record = status === "published" ? { status, published_at: new Date().toISOString() } : { status };
  const { data } = await supabase.from("articles").update(record).eq("id", id).select("slug").single();
  if (data) refreshPublic(data.slug);
  revalidatePath("/admin/articles");
}

export async function deleteArticleAction(id: string, _formData: FormData) {
  void _formData;
  articleIdSchema.parse(id);
  await requireAdmin("/admin/articles");
  const supabase = await createClient();
  if (!supabase) return;
  const { data } = await supabase.from("articles").delete().eq("id", id).select("slug").single();
  if (data) refreshPublic(data.slug);
  revalidatePath("/admin/articles");
}
