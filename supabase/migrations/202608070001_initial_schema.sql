-- Topicora's complete initial schema. Policies use database time so future-dated
-- published articles remain private until their scheduled publication time.

create extension if not exists pgcrypto with schema extensions;

do $$ begin
  create type public.app_role as enum ('admin', 'editor', 'author');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.article_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscriber_status as enum ('pending', 'active', 'unsubscribed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.contact_status as enum ('new', 'read', 'resolved');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.disclosure_type as enum ('none', 'opinion', 'financial', 'affiliate', 'sponsored', 'ai_assisted');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  bio text,
  avatar_url text,
  role public.app_role not null default 'author',
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  category_id uuid not null references public.categories(id),
  title text not null check (char_length(title) between 5 and 180),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null check (char_length(excerpt) between 20 and 500),
  content_markdown text not null,
  cover_image_url text,
  cover_image_alt text,
  cover_image_caption text,
  status public.article_status not null default 'draft',
  disclosure public.disclosure_type not null default 'none',
  disclosure_note text,
  is_featured boolean not null default false,
  published_at timestamptz,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  canonical_url text,
  reading_time_minutes integer not null default 1 check (reading_time_minutes >= 1),
  search_vector tsvector not null default ''::tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cover_alt_required check (cover_image_url is null or nullif(btrim(cover_image_alt), '') is not null),
  constraint published_time_required check (status <> 'published' or published_at is not null)
);

create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status public.subscriber_status not null default 'pending',
  confirmation_token_hash text,
  source text not null default 'website',
  consent_text text not null,
  subscribed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create unique index if not exists newsletter_email_case_insensitive_idx
  on public.newsletter_subscribers (lower(email));

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reason text not null check (reason in ('general feedback', 'correction', 'business enquiry')),
  article_url text,
  subject text not null,
  message text not null,
  status public.contact_status not null default 'new',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.form_rate_limits (
  key_hash text primary key,
  hits integer not null default 1,
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_slug_idx on public.articles (slug);
create index if not exists articles_status_published_at_idx on public.articles (status, published_at desc);
create index if not exists articles_category_idx on public.articles (category_id);
create index if not exists articles_featured_idx on public.articles (is_featured) where is_featured;
create unique index if not exists articles_only_one_featured_idx on public.articles ((is_featured)) where is_featured;
create index if not exists categories_slug_idx on public.categories (slug);
create index if not exists tags_slug_idx on public.tags (slug);
create index if not exists contact_messages_status_idx on public.contact_messages (status);
create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers (status);
create index if not exists articles_search_vector_idx on public.articles using gin (search_vector);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.update_article_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.content_markdown, '')), 'C');
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
security definer
language plpgsql
set search_path = ''
as $$
declare
  base_name text;
  profile_slug text;
begin
  base_name := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, 'Topicora author'), '@', 1));
  profile_slug := regexp_replace(lower(base_name), '[^a-z0-9]+', '-', 'g');
  profile_slug := trim(both '-' from profile_slug) || '-' || left(new.id::text, 8);

  insert into public.profiles (id, display_name, slug)
  values (new.id, base_name, profile_slug)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.current_app_role()
returns public.app_role
security definer
stable
language sql
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.can_manage_content()
returns boolean
security definer
stable
language sql
set search_path = ''
as $$
  select coalesce(public.current_app_role() in ('admin', 'editor'), false);
$$;

create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null
     and old.role is distinct from new.role
     and public.current_app_role() <> 'admin' then
    raise exception 'Only administrators can change profile roles';
  end if;
  return new;
end;
$$;

create or replace function public.search_published_articles(
  search_query text,
  category_filter text default null,
  result_limit integer default 12,
  result_offset integer default 0
)
returns table (
  id uuid,
  title text,
  slug text,
  excerpt text,
  result_excerpt text,
  published_at timestamptz,
  category_name text,
  category_slug text,
  rank real,
  total_count bigint
)
language sql
stable
set search_path = ''
as $$
  with query as (
    select websearch_to_tsquery('english', left(btrim(search_query), 120)) as value
  ), matches as (
    select
      a.id,
      a.title,
      a.slug,
      a.excerpt,
      ts_headline(
        'english',
        regexp_replace(a.content_markdown, '[#*_>`~\[\]()]', ' ', 'g'),
        query.value,
        'StartSel=<mark>, StopSel=</mark>, MaxWords=28, MinWords=12, ShortWord=3'
      ) as result_excerpt,
      a.published_at,
      c.name as category_name,
      c.slug as category_slug,
      ts_rank_cd(a.search_vector, query.value) as rank
    from public.articles a
    join public.categories c on c.id = a.category_id
    cross join query
    where a.status = 'published'
      and a.published_at is not null
      and a.published_at <= now()
      and (category_filter is null or c.slug = category_filter)
      and a.search_vector @@ query.value
  )
  select matches.*, count(*) over () as total_count
  from matches
  order by rank desc, published_at desc
  limit least(greatest(result_limit, 1), 50)
  offset greatest(result_offset, 0);
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists articles_update_search_vector on public.articles;
create trigger articles_update_search_vector before insert or update of title, excerpt, content_markdown on public.articles
for each row execute function public.update_article_search_vector();

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
for each row execute function public.prevent_unauthorized_role_change();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

create policy "Published authors are publicly readable" on public.profiles
for select using (
  id = (select auth.uid())
  or public.can_manage_content()
  or exists (
    select 1 from public.articles a
    where a.author_id = profiles.id and a.status = 'published'
      and a.published_at is not null and a.published_at <= now()
  )
);
comment on policy "Published authors are publicly readable" on public.profiles is
  'Readers can see public author bios; signed-in staff can see the profiles required by the CMS.';

create policy "Administrators manage profiles" on public.profiles
for all using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');
comment on policy "Administrators manage profiles" on public.profiles is
  'Only administrators may manage arbitrary profiles or grant roles.';

create policy "Staff update their own profile" on public.profiles
for update using (id = (select auth.uid()))
with check (id = (select auth.uid()));
comment on policy "Staff update their own profile" on public.profiles is
  'Authenticated users may edit only their own profile; a trigger prevents non-admin role changes.';

create policy "Categories are publicly readable" on public.categories
for select using (true);
comment on policy "Categories are publicly readable" on public.categories is
  'Categories are public discovery metadata.';

create policy "Editors manage categories" on public.categories
for all using (public.can_manage_content()) with check (public.can_manage_content());
comment on policy "Editors manage categories" on public.categories is
  'Administrators and editors can create, edit, and remove category metadata.';

create policy "Tags are publicly readable" on public.tags
for select using (true);
comment on policy "Tags are publicly readable" on public.tags is
  'Tags are public discovery metadata.';

create policy "Editors manage tags" on public.tags
for all using (public.can_manage_content()) with check (public.can_manage_content());
comment on policy "Editors manage tags" on public.tags is
  'Administrators and editors can create, edit, and remove tag metadata.';

create policy "Only current published articles are public" on public.articles
for select using (
  status = 'published' and published_at is not null and published_at <= now()
);
comment on policy "Only current published articles are public" on public.articles is
  'Readers cannot query drafts, archives, or future scheduled articles.';

create policy "Staff read all articles" on public.articles
for select using (public.can_manage_content() or author_id = (select auth.uid()));
comment on policy "Staff read all articles" on public.articles is
  'Staff can read content for the dashboard and authors can read their own drafts.';

create policy "Editors create articles" on public.articles
for insert with check (public.can_manage_content() and author_id = (select auth.uid()));
comment on policy "Editors create articles" on public.articles is
  'Editors and administrators create content attributed to their authenticated profile.';

create policy "Editors update articles" on public.articles
for update using (public.can_manage_content()) with check (public.can_manage_content());
comment on policy "Editors update articles" on public.articles is
  'Editors and administrators may edit article records; authorization is checked again in server actions.';

create policy "Administrators delete articles" on public.articles
for delete using (public.current_app_role() = 'admin');
comment on policy "Administrators delete articles" on public.articles is
  'Permanent deletion is restricted to administrators.';

create policy "Published article tags are public" on public.article_tags
for select using (
  exists (
    select 1 from public.articles a
    where a.id = article_tags.article_id and a.status = 'published'
      and a.published_at is not null and a.published_at <= now()
  )
);
comment on policy "Published article tags are public" on public.article_tags is
  'Tag relationships cannot reveal drafts or scheduled content.';

create policy "Editors manage article tags" on public.article_tags
for all using (public.can_manage_content()) with check (public.can_manage_content());
comment on policy "Editors manage article tags" on public.article_tags is
  'Administrators and editors manage article taxonomy.';

create policy "Administrators read subscribers" on public.newsletter_subscribers
for select using (public.current_app_role() = 'admin');
comment on policy "Administrators read subscribers" on public.newsletter_subscribers is
  'Subscriber addresses are private and visible only to administrators.';

create policy "Administrators manage subscribers" on public.newsletter_subscribers
for update using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
comment on policy "Administrators manage subscribers" on public.newsletter_subscribers is
  'Public subscription mutations use server-only service-role routes; administrators manage status.';

create policy "Staff read contact messages" on public.contact_messages
for select using (public.can_manage_content());
comment on policy "Staff read contact messages" on public.contact_messages is
  'Contact messages are private and available to authenticated editorial staff.';

create policy "Staff update contact messages" on public.contact_messages
for update using (public.can_manage_content()) with check (public.can_manage_content());
comment on policy "Staff update contact messages" on public.contact_messages is
  'Editorial staff may triage message status; public inserts use a server-only route.';

create policy "Public site settings are readable" on public.site_settings
for select using (key like 'public.%');
comment on policy "Public site settings are readable" on public.site_settings is
  'Only explicitly public-prefixed settings may be read anonymously.';

create policy "Administrators manage site settings" on public.site_settings
for all using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
comment on policy "Administrators manage site settings" on public.site_settings is
  'Only administrators can change publication settings.';

grant execute on function public.search_published_articles(text, text, integer, integer) to anon, authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.can_manage_content() to authenticated;

-- SQL grants define which operations can reach RLS. Policies above remain the
-- final authorization boundary for every authenticated request.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.profiles, public.categories, public.tags, public.articles,
  public.article_tags, public.site_settings to anon;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on public.profiles, public.categories, public.tags,
  public.articles, public.article_tags, public.site_settings to authenticated;
grant update on public.newsletter_subscribers, public.contact_messages to authenticated;
grant all privileges on all tables in schema public to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-media',
  'article-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Article media is publicly readable" on storage.objects
for select using (bucket_id = 'article-media');
comment on policy "Article media is publicly readable" on storage.objects is
  'The article-media bucket serves publication imagery. Draft URLs must use unpredictable generated paths.';

create policy "Editorial staff upload article media" on storage.objects
for insert to authenticated
with check (bucket_id = 'article-media' and public.can_manage_content());
comment on policy "Editorial staff upload article media" on storage.objects is
  'Authenticated administrators and editors can upload validated images to generated paths only.';

create policy "Editorial staff update article media" on storage.objects
for update to authenticated
using (bucket_id = 'article-media' and public.can_manage_content())
with check (bucket_id = 'article-media' and public.can_manage_content());
comment on policy "Editorial staff update article media" on storage.objects is
  'Authenticated administrators and editors can replace article media.';

create policy "Editorial staff delete article media" on storage.objects
for delete to authenticated
using (bucket_id = 'article-media' and public.can_manage_content());
comment on policy "Editorial staff delete article media" on storage.objects is
  'Authenticated administrators and editors can remove article media.';

insert into public.site_settings (key, value) values
  ('public.publication', '{"name":"Topicora","tagline":"Useful ideas, wherever curiosity leads."}'::jsonb),
  ('public.redirects', '[]'::jsonb)
on conflict (key) do nothing;
