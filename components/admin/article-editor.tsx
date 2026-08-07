"use client";

import { Eye, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { BlockEditor } from "@/components/admin/block-editor";
import {
  createArticleAction,
  updateArticleAction,
} from "@/lib/actions/articles";
import { initialActionState } from "@/lib/actions/state";
import { slugify } from "@/lib/utils/slug";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };
type EditableArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  content_blocks: unknown;
  category_id: string;
  tag_ids: string[];
  status: "draft" | "published" | "archived";
  disclosure:
    | "none"
    | "opinion"
    | "financial"
    | "affiliate"
    | "sponsored"
    | "ai_assisted";
  disclosure_note: string | null;
  is_featured: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_caption: string | null;
};

const fieldError = (
  errors: Record<string, string[]> | undefined,
  field: string,
) => errors?.[field]?.[0];
const toLocalDate = (value: string | null | undefined) =>
  value
    ? new Date(new Date(value).getTime() + 5.5 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : "";

export function ArticleEditor({
  article,
  categories,
  tags,
}: {
  article?: EditableArticle;
  categories: Category[];
  tags: Tag[];
}) {
  const selectedAction = article
    ? updateArticleAction.bind(null, article.id)
    : createArticleAction;
  const [state, action, pending] = useActionState(
    selectedAction,
    initialActionState,
  );
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(article));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    const captureLink = (event: MouseEvent) => {
      if (!dirty) return;
      const target =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (
        target &&
        target instanceof HTMLAnchorElement &&
        target.origin === window.location.origin &&
        !window.confirm("Leave without saving your article changes?")
      )
        event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", captureLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", captureLink, true);
    };
  }, [dirty]);

  return (
    <form
      action={action}
      onChange={() => setDirty(true)}
      className="grid gap-7"
    >
      <div className="border-border bg-background/95 sticky top-0 z-20 -mx-5 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 backdrop-blur lg:top-0">
        <div>
          <p className="text-muted-foreground text-xs font-bold">
            {article ? "Editing article" : "New article"}
          </p>
          <p className="font-serif text-lg font-semibold">
            {title || "Untitled draft"}
          </p>
        </div>
        <div className="flex gap-2">
          {article ? (
            <Link
              className="button-secondary"
              href={`/api/preview?article=${article.id}`}
              target="_blank"
            >
              <Eye aria-hidden="true" size={16} /> Preview draft
            </Link>
          ) : null}
          <button className="button-primary" type="submit" disabled={pending}>
            <Save aria-hidden="true" size={16} />
            {pending ? "Saving…" : "Save article"}
          </button>
        </div>
      </div>
      {state.message ? (
        <p
          className="border-danger/30 bg-danger/5 text-danger rounded-lg border p-3 text-sm"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <section className="border-border bg-surface grid gap-5 rounded-xl border p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold">Story</h2>
        <label className="grid gap-2 text-sm font-bold">
          Title
          <input
            className="field"
            name="title"
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              if (!slugEdited) setSlug(slugify(value));
            }}
            required
          />
          {fieldError(state.errors, "title") ? (
            <span className="text-danger text-xs">
              {fieldError(state.errors, "title")}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Slug
          <input
            className="field font-mono"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(slugify(event.target.value));
            }}
            required
          />
          {article && slug !== article.slug ? (
            <span className="text-danger text-xs">
              Changing a published slug can break existing links. Add a redirect
              in Settings.
            </span>
          ) : null}
          {fieldError(state.errors, "slug") ? (
            <span className="text-danger text-xs">
              {fieldError(state.errors, "slug")}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Excerpt
          <textarea
            className="field min-h-28"
            name="excerpt"
            defaultValue={article?.excerpt}
            maxLength={500}
            required
          />
          {fieldError(state.errors, "excerpt") ? (
            <span className="text-danger text-xs">
              {fieldError(state.errors, "excerpt")}
            </span>
          ) : null}
        </label>
        <div>
          <BlockEditor
            initialBlocks={article?.content_blocks}
            fallbackMarkdown={article?.content_markdown}
          />
          {fieldError(state.errors, "contentMarkdown") ? (
            <span className="text-danger mt-2 block text-xs">
              {fieldError(state.errors, "contentMarkdown")}
            </span>
          ) : null}
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-2">
        <section className="border-border bg-surface grid content-start gap-5 rounded-xl border p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold">Publication</h2>
          <label className="grid gap-2 text-sm font-bold">
            Category
            <select
              className="field"
              name="category_id"
              defaultValue={article?.category_id}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm font-bold">Tags</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  className="border-border flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm"
                  key={tag.id}
                >
                  <input
                    type="checkbox"
                    name="tag_ids"
                    value={tag.id}
                    defaultChecked={article?.tag_ids.includes(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-bold">
            Status
            <select
              className="field"
              name="status"
              defaultValue={article?.status ?? "draft"}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Publish or schedule (IST)
            <input
              className="field"
              type="datetime-local"
              name="published_at"
              defaultValue={toLocalDate(article?.published_at)}
            />
            <span className="text-muted-foreground text-xs font-normal">
              Future dates remain private until that time.
            </span>
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={article?.is_featured}
            />
            Feature on homepage
          </label>
        </section>

        <section className="border-border bg-surface grid content-start gap-5 rounded-xl border p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold">
            Disclosure & SEO
          </h2>
          <label className="grid gap-2 text-sm font-bold">
            Disclosure
            <select
              className="field"
              name="disclosure"
              defaultValue={article?.disclosure ?? "none"}
            >
              <option value="none">None</option>
              <option value="opinion">Opinion</option>
              <option value="financial">Financial</option>
              <option value="affiliate">Affiliate</option>
              <option value="sponsored">Sponsored</option>
              <option value="ai_assisted">AI-assisted</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Disclosure note
            <textarea
              className="field min-h-24"
              name="disclosure_note"
              defaultValue={article?.disclosure_note ?? ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            SEO title
            <input
              className="field"
              name="seo_title"
              defaultValue={article?.seo_title ?? ""}
              maxLength={70}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            SEO description
            <textarea
              className="field min-h-24"
              name="seo_description"
              defaultValue={article?.seo_description ?? ""}
              maxLength={170}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            External canonical URL
            <input
              className="field"
              name="canonical_url"
              type="url"
              defaultValue={article?.canonical_url ?? ""}
              placeholder="Leave blank to use the Topicora URL"
            />
          </label>
        </section>
      </div>

      <section className="border-border bg-surface grid gap-5 rounded-xl border p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-semibold">Cover image</h2>
        {article?.cover_image_url ? (
          <div className="bg-muted relative aspect-[16/6] max-w-2xl overflow-hidden rounded-lg">
            <Image
              src={article.cover_image_url}
              alt={article.cover_image_alt ?? "Current cover"}
              fill
              sizes="800px"
              className="object-cover"
            />
          </div>
        ) : null}
        <input
          type="hidden"
          name="existing_cover_image_url"
          value={article?.cover_image_url ?? ""}
        />
        <label className="grid gap-2 text-sm font-bold">
          Upload image
          <input
            className="field"
            type="file"
            name="cover_image"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          />
          <span className="text-muted-foreground text-xs font-normal">
            JPEG, PNG, WebP, AVIF, or GIF; maximum 5 MB. SVG is rejected.
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Alt text
          <input
            className="field"
            name="cover_image_alt"
            defaultValue={article?.cover_image_alt ?? ""}
            maxLength={300}
          />
          <span className="text-muted-foreground text-xs font-normal">
            Required whenever a cover is present. Describe what the image
            communicates.
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Caption
          <input
            className="field"
            name="cover_image_caption"
            defaultValue={article?.cover_image_caption ?? ""}
            maxLength={500}
          />
        </label>
      </section>
    </form>
  );
}
