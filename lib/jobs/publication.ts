import "server-only";

import { revalidatePath } from "next/cache";

import { recordAuditEvent } from "@/lib/audit/log";
import { createAdminClient } from "@/lib/supabase/admin";

type PublicationJob = {
  id: string;
  article_id: string;
  attempts: number;
};

function refreshPublishedArticle(slug: string, categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  if (categorySlug) revalidatePath(`/category/${categorySlug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
}

export async function processDuePublicationJobs(batchSize = 25) {
  const supabase = createAdminClient();
  if (!supabase)
    return { ok: false as const, processed: 0, message: "Not configured" };
  const { data, error } = await supabase.rpc("claim_due_publication_jobs", {
    batch_size: batchSize,
  });
  if (error)
    return { ok: false as const, processed: 0, message: error.message };
  const jobs = (data ?? []) as PublicationJob[];
  let processed = 0;

  for (const job of jobs) {
    try {
      const { data: article } = await supabase
        .from("articles")
        .select("slug,status,published_at,category:categories(slug)")
        .eq("id", job.article_id)
        .single();
      const publicationTime = article?.published_at
        ? new Date(article.published_at).getTime()
        : Number.POSITIVE_INFINITY;
      if (
        !article ||
        article.status !== "published" ||
        publicationTime > Date.now()
      ) {
        await supabase
          .from("publication_jobs")
          .update({
            status: "cancelled",
            locked_at: null,
            last_error: "Article is no longer due for publication.",
          })
          .eq("id", job.id);
        continue;
      }
      const category = Array.isArray(article.category)
        ? article.category[0]
        : article.category;
      refreshPublishedArticle(article.slug, category?.slug);
      await supabase
        .from("publication_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          locked_at: null,
          last_error: null,
        })
        .eq("id", job.id);
      await recordAuditEvent({
        actorId: null,
        action: "article.scheduled_publication_revalidated",
        entityType: "articles",
        entityId: job.article_id,
        metadata: { attempt: job.attempts },
      });
      processed += 1;
    } catch (jobError) {
      await supabase
        .from("publication_jobs")
        .update({
          status: "failed",
          locked_at: null,
          last_error:
            jobError instanceof Error
              ? jobError.message.slice(0, 500)
              : "Unknown publication worker error",
        })
        .eq("id", job.id);
    }
  }
  return { ok: true as const, processed, claimed: jobs.length };
}
