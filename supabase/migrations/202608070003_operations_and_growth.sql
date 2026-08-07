do $$ begin
  create type public.newsletter_frequency as enum ('weekly', 'monthly');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_status as enum ('draft', 'scheduled', 'sending', 'sent', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.delivery_status as enum ('queued', 'sending', 'sent', 'failed', 'skipped');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.publication_job_status as enum ('queued', 'processing', 'completed', 'cancelled', 'failed');
exception when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists mfa_required boolean not null default false;

alter table public.articles
  add column if not exists content_blocks jsonb not null default '[]'::jsonb,
  add column if not exists content_format text not null default 'markdown';

alter table public.articles
  drop constraint if exists articles_content_blocks_array,
  add constraint articles_content_blocks_array check (jsonb_typeof(content_blocks) = 'array'),
  drop constraint if exists articles_content_format_allowed,
  add constraint articles_content_format_allowed check (content_format in ('markdown', 'blocks'));

alter table public.newsletter_subscribers
  add column if not exists topic_slugs text[] not null default '{}'::text[],
  add column if not exists frequency public.newsletter_frequency not null default 'weekly',
  add column if not exists preferences_updated_at timestamptz not null default now();

create table if not exists public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text not null,
  role public.app_role not null check (role in ('admin', 'editor', 'author')),
  invited_by uuid references public.profiles(id) on delete set null,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists staff_invitations_pending_email_idx
  on public.staff_invitations (lower(email))
  where accepted_at is null and revoked_at is null;

create table if not exists public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  revision_number integer not null,
  created_by uuid references public.profiles(id) on delete set null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (article_id, revision_number)
);

create index if not exists article_revisions_article_created_idx
  on public.article_revisions (article_id, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

create table if not exists public.publication_jobs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null unique references public.articles(id) on delete cascade,
  run_at timestamptz not null,
  status public.publication_job_status not null default 'queued',
  attempts integer not null default 0 check (attempts >= 0),
  locked_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists publication_jobs_due_idx
  on public.publication_jobs (status, run_at)
  where status in ('queued', 'failed');

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) between 5 and 160),
  preheader text check (preheader is null or char_length(preheader) <= 200),
  content_markdown text not null check (char_length(content_markdown) >= 20),
  status public.campaign_status not null default 'draft',
  target_topic_slugs text[] not null default '{}'::text[],
  target_frequency public.newsletter_frequency,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_campaign_time check (status <> 'scheduled' or scheduled_at is not null)
);

create index if not exists newsletter_campaigns_due_idx
  on public.newsletter_campaigns (status, scheduled_at)
  where status in ('scheduled', 'sending');

create table if not exists public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.newsletter_campaigns(id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  status public.delivery_status not null default 'queued',
  provider_message_id text,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, subscriber_id)
);

create index if not exists newsletter_deliveries_queue_idx
  on public.newsletter_deliveries (campaign_id, status, created_at);

create or replace function public.handle_new_auth_user()
returns trigger
security definer
language plpgsql
set search_path = ''
as $$
declare
  base_name text;
  profile_slug text;
  invitation public.staff_invitations%rowtype;
begin
  select * into invitation
  from public.staff_invitations
  where lower(email) = lower(coalesce(new.email, ''))
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  base_name := coalesce(
    nullif(btrim(invitation.display_name), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(coalesce(new.email, 'Topicora author'), '@', 1)
  );
  profile_slug := regexp_replace(lower(base_name), '[^a-z0-9]+', '-', 'g');
  profile_slug := trim(both '-' from profile_slug) || '-' || left(new.id::text, 8);

  insert into public.profiles (id, display_name, slug, role, mfa_required)
  values (
    new.id,
    base_name,
    profile_slug,
    coalesce(invitation.role, 'author'::public.app_role),
    invitation.id is not null
  )
  on conflict (id) do nothing;

  if invitation.id is not null then
    update public.staff_invitations
    set auth_user_id = new.id
    where id = invitation.id;
  end if;
  return new;
end;
$$;

create or replace function public.has_completed_required_mfa()
returns boolean
security definer
stable
language sql
set search_path = ''
as $$
  select coalesce(
    (
      select (not profile.mfa_required)
        or coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      from public.profiles profile
      where profile.id = (select auth.uid())
    ),
    true
  );
$$;

create or replace function public.protect_profile_security_fields()
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
  if auth.uid() is not null
     and old.mfa_required = true
     and new.mfa_required = false
     and public.current_app_role() <> 'admin' then
    raise exception 'Only administrators can remove an MFA requirement';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_security before update on public.profiles
for each row execute function public.protect_profile_security_fields();

create or replace function public.capture_article_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision integer;
begin
  select coalesce(max(revision_number), 0) + 1 into next_revision
  from public.article_revisions
  where article_id = new.id;

  insert into public.article_revisions (
    article_id,
    revision_number,
    created_by,
    snapshot
  ) values (
    new.id,
    next_revision,
    auth.uid(),
    to_jsonb(new) - 'search_vector'
  );
  return new;
end;
$$;

drop trigger if exists articles_capture_revision on public.articles;
create trigger articles_capture_revision after insert or update on public.articles
for each row execute function public.capture_article_revision();

create or replace function public.sync_publication_job()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published'
     and new.published_at is not null
     and new.published_at > clock_timestamp() then
    insert into public.publication_jobs (
      article_id,
      run_at,
      status,
      attempts,
      locked_at,
      completed_at,
      last_error,
      created_by
    ) values (
      new.id,
      new.published_at,
      'queued',
      0,
      null,
      null,
      null,
      auth.uid()
    )
    on conflict (article_id) do update set
      run_at = excluded.run_at,
      status = 'queued',
      attempts = 0,
      locked_at = null,
      completed_at = null,
      last_error = null,
      created_by = excluded.created_by,
      updated_at = now();
  else
    update public.publication_jobs
    set status = 'cancelled', locked_at = null, updated_at = now()
    where article_id = new.id and status in ('queued', 'processing', 'failed');
  end if;
  return new;
end;
$$;

drop trigger if exists articles_sync_publication_job on public.articles;
create trigger articles_sync_publication_job after insert or update of status, published_at on public.articles
for each row execute function public.sync_publication_job();

create or replace function public.claim_due_publication_jobs(batch_size integer default 25)
returns setof public.publication_jobs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.publication_jobs jobs
  set
    status = 'processing',
    attempts = jobs.attempts + 1,
    locked_at = now(),
    updated_at = now()
  where jobs.id in (
    select candidate.id
    from public.publication_jobs candidate
    where candidate.run_at <= now()
      and (
        candidate.status in ('queued', 'failed')
        or (candidate.status = 'processing' and candidate.locked_at < now() - interval '10 minutes')
      )
      and candidate.attempts < 5
    order by candidate.run_at
    for update skip locked
    limit least(greatest(batch_size, 1), 100)
  )
  returning jobs.*;
end;
$$;

create or replace function public.claim_due_campaigns(batch_size integer default 5)
returns setof public.newsletter_campaigns
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.newsletter_campaigns campaigns
  set status = 'sending', updated_at = now()
  where campaigns.id in (
    select candidate.id
    from public.newsletter_campaigns candidate
    where (
      candidate.status = 'scheduled'
      and candidate.scheduled_at <= now()
    ) or candidate.status = 'sending'
    order by candidate.scheduled_at nulls first
    for update skip locked
    limit least(greatest(batch_size, 1), 20)
  )
  returning campaigns.*;
end;
$$;

create or replace function public.record_audit_event(
  event_actor uuid,
  event_action text,
  event_entity_type text,
  event_entity_id text default null,
  event_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_id uuid;
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    event_actor,
    left(event_action, 120),
    left(event_entity_type, 80),
    left(event_entity_id, 200),
    coalesce(event_metadata, '{}'::jsonb)
  )
  returning id into event_id;
  return event_id;
end;
$$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Audit log records are immutable';
end;
$$;

drop trigger if exists audit_logs_immutable on public.audit_logs;
create trigger audit_logs_immutable before update or delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

create or replace function public.audit_managed_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_data jsonb;
  record_id text;
begin
  record_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  record_id := coalesce(record_data ->> 'id', record_data ->> 'key');
  perform public.record_audit_event(
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    record_id,
    jsonb_build_object('source', 'database-trigger')
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists audit_articles on public.articles;
create trigger audit_articles after insert or update or delete on public.articles
for each row execute function public.audit_managed_change();
drop trigger if exists audit_categories on public.categories;
create trigger audit_categories after insert or update or delete on public.categories
for each row execute function public.audit_managed_change();
drop trigger if exists audit_tags on public.tags;
create trigger audit_tags after insert or update or delete on public.tags
for each row execute function public.audit_managed_change();
drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles after update on public.profiles
for each row execute function public.audit_managed_change();
drop trigger if exists audit_site_settings on public.site_settings;
create trigger audit_site_settings after insert or update or delete on public.site_settings
for each row execute function public.audit_managed_change();
drop trigger if exists audit_staff_invitations on public.staff_invitations;
create trigger audit_staff_invitations after insert or update on public.staff_invitations
for each row execute function public.audit_managed_change();
drop trigger if exists audit_newsletter_campaigns on public.newsletter_campaigns;
create trigger audit_newsletter_campaigns after insert or update or delete on public.newsletter_campaigns
for each row execute function public.audit_managed_change();

create trigger publication_jobs_set_updated_at before update on public.publication_jobs
for each row execute function public.set_updated_at();
create trigger newsletter_campaigns_set_updated_at before update on public.newsletter_campaigns
for each row execute function public.set_updated_at();
create trigger newsletter_deliveries_set_updated_at before update on public.newsletter_deliveries
for each row execute function public.set_updated_at();

alter table public.staff_invitations enable row level security;
alter table public.article_revisions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.publication_jobs enable row level security;
alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_deliveries enable row level security;

create policy "Administrators manage staff invitations" on public.staff_invitations
for all using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

create policy "Editorial staff read article revisions" on public.article_revisions
for select using (public.can_manage_content());

create policy "Administrators read audit logs" on public.audit_logs
for select using (public.current_app_role() = 'admin');

create policy "Editorial staff read publication jobs" on public.publication_jobs
for select using (public.can_manage_content());

create policy "Administrators manage campaigns" on public.newsletter_campaigns
for all using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

create policy "Administrators read newsletter deliveries" on public.newsletter_deliveries
for select using (public.current_app_role() = 'admin');

create policy "Required MFA protects articles" on public.articles as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects categories" on public.categories as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects tags" on public.tags as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects article tags" on public.article_tags as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects subscribers" on public.newsletter_subscribers as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects messages" on public.contact_messages as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects settings" on public.site_settings as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects staff invitations" on public.staff_invitations as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects article revisions" on public.article_revisions as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects audit logs" on public.audit_logs as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects publication jobs" on public.publication_jobs as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects campaigns" on public.newsletter_campaigns as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects deliveries" on public.newsletter_deliveries as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());
create policy "Required MFA protects media" on storage.objects as restrictive
for all to authenticated using (public.has_completed_required_mfa())
with check (public.has_completed_required_mfa());

grant execute on function public.has_completed_required_mfa() to authenticated;
revoke all on function public.claim_due_publication_jobs(integer) from public, anon, authenticated;
revoke all on function public.claim_due_campaigns(integer) from public, anon, authenticated;
revoke all on function public.record_audit_event(uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.claim_due_publication_jobs(integer) to service_role;
grant execute on function public.claim_due_campaigns(integer) to service_role;
grant execute on function public.record_audit_event(uuid, text, text, text, jsonb) to service_role;

grant select, insert, update, delete on public.staff_invitations to authenticated;
grant select on public.article_revisions, public.audit_logs, public.publication_jobs,
  public.newsletter_deliveries to authenticated;
grant select, insert, update, delete on public.newsletter_campaigns to authenticated;
grant all privileges on public.staff_invitations, public.article_revisions, public.audit_logs,
  public.publication_jobs, public.newsletter_campaigns, public.newsletter_deliveries to service_role;
