-- Atomic, service-role-only rate limiting for server-validated public forms.
create or replace function public.check_form_rate_limit(
  rate_key text,
  max_hits integer,
  window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_record private.form_rate_limits%rowtype;
begin
  if char_length(rate_key) <> 64 or max_hits < 1 or window_seconds < 1 then
    return false;
  end if;

  insert into private.form_rate_limits (key_hash, hits, window_started_at, updated_at)
  values (rate_key, 1, clock_timestamp(), clock_timestamp())
  on conflict (key_hash) do update set
    hits = case
      when private.form_rate_limits.window_started_at <= clock_timestamp() - make_interval(secs => window_seconds)
        then 1
      else private.form_rate_limits.hits + 1
    end,
    window_started_at = case
      when private.form_rate_limits.window_started_at <= clock_timestamp() - make_interval(secs => window_seconds)
        then clock_timestamp()
      else private.form_rate_limits.window_started_at
    end,
    updated_at = clock_timestamp()
  returning * into current_record;

  delete from private.form_rate_limits
  where updated_at < clock_timestamp() - interval '2 days';

  return current_record.hits <= max_hits;
end;
$$;

revoke all on function public.check_form_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_form_rate_limit(text, integer, integer) to service_role;

comment on function public.check_form_rate_limit(text, integer, integer) is
  'Atomically enforces hashed server-side public-form rate limits; callable only with the service role.';
