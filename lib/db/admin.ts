import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboard() {
  const supabase = await createClient();
  if (!supabase)
    return {
      articles: 0,
      published: 0,
      drafts: 0,
      messages: 0,
      subscribers: 0,
    };
  const [articles, published, drafts, messages, subscribers] =
    await Promise.all([
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);
  return {
    articles: articles.count ?? 0,
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    messages: messages.count ?? 0,
    subscribers: subscribers.count ?? 0,
  };
}

export async function getAdminArticles() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("articles")
    .select(
      "id,title,slug,status,is_featured,published_at,updated_at,category:categories(name)",
    )
    .order("updated_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getAdminArticle(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("articles")
    .select("*,article_tags(tag_id)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    tag_ids: (data.article_tags as { tag_id: string }[]).map(
      (item) => item.tag_id,
    ),
  };
}

export async function getArticleRevisions(articleId: string) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("article_revisions")
    .select(
      "id,revision_number,snapshot,created_at,creator:profiles(display_name)",
    )
    .eq("article_id", articleId)
    .order("revision_number", { ascending: false })
    .limit(30);
  return (data ?? []).map((revision) => ({
    ...revision,
    creator: Array.isArray(revision.creator)
      ? (revision.creator[0] ?? null)
      : revision.creator,
  }));
}

export async function getAdminTaxonomy() {
  const supabase = await createClient();
  if (!supabase) return { categories: [], tags: [] };
  const [categories, tags] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("tags").select("*").order("name"),
  ]);
  return { categories: categories.data ?? [], tags: tags.data ?? [] };
}

export async function getContactMessages() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getSubscribers() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select(
      "id,email,status,source,subscribed_at,confirmed_at,unsubscribed_at,topic_slugs,frequency",
    )
    .order("subscribed_at", { ascending: false })
    .limit(250);
  return data ?? [];
}

export async function getSiteSettings() {
  const supabase = await createClient();
  const fallback = {
    publication: {
      name: "Topicora",
      tagline: "Useful ideas, wherever curiosity leads.",
    },
    redirects: [] as { from: string; to: string }[],
  };
  if (!supabase) return fallback;
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["public.publication", "public.redirects"]);
  const publication = data?.find((item) => item.key === "public.publication")
    ?.value as typeof fallback.publication | undefined;
  const redirects = data?.find((item) => item.key === "public.redirects")
    ?.value as typeof fallback.redirects | undefined;
  return {
    publication: publication ?? fallback.publication,
    redirects: redirects ?? fallback.redirects,
  };
}

export async function getStaffDirectory() {
  const supabase = await createClient();
  if (!supabase) return { profiles: [], invitations: [] };
  const [profiles, invitations] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,display_name,slug,role,mfa_required,created_at")
      .order("display_name"),
    supabase
      .from("staff_invitations")
      .select(
        "id,email,display_name,role,created_at,expires_at,accepted_at,revoked_at",
      )
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  return {
    profiles: profiles.data ?? [],
    invitations: invitations.data ?? [],
  };
}

export async function getAuditLogs() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("audit_logs")
    .select(
      "id,action,entity_type,entity_id,metadata,created_at,actor:profiles(display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(250);
  return (data ?? []).map((event) => ({
    ...event,
    actor: Array.isArray(event.actor) ? (event.actor[0] ?? null) : event.actor,
  }));
}

export async function getPublicationJobs() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("publication_jobs")
    .select(
      "id,run_at,status,attempts,last_error,completed_at,article:articles(title,slug)",
    )
    .order("run_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getCampaigns() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("newsletter_campaigns")
    .select(
      "id,subject,status,target_frequency,target_topic_slugs,scheduled_at,sent_at,updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getCampaign(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("newsletter_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}
