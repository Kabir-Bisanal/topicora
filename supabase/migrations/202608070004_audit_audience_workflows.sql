drop trigger if exists audit_newsletter_subscribers on public.newsletter_subscribers;
create trigger audit_newsletter_subscribers
after insert or update on public.newsletter_subscribers
for each row execute function public.audit_managed_change();

drop trigger if exists audit_contact_messages on public.contact_messages;
create trigger audit_contact_messages
after update on public.contact_messages
for each row execute function public.audit_managed_change();

comment on table public.audit_logs is
  'Append-only operational audit events. Row snapshots and subscriber/contact PII are intentionally excluded.';

comment on table public.article_revisions is
  'Restorable article snapshots captured automatically after each insert or update.';

comment on table public.publication_jobs is
  'Durable queue for scheduled publication cache invalidation with retry-safe claiming.';

comment on table public.newsletter_campaigns is
  'Consent-aware newsletter campaigns segmented by topic and delivery frequency.';
