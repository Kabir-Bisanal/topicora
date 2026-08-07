# Topicora Deployment Guide

This guide deploys Supabase first and the Next.js application to Vercel second. Use separate Supabase/Vercel projects for staging and production.

## 1. Prepare production services

Create:

1. A Supabase project in the intended region.
2. A Vercel project connected to this repository.
3. A Resend account with a verified sending domain if email delivery is required.

Record the Supabase project URL, browser-safe anon/publishable key, service-role key, and project reference. Keep the service key private.

## 2. Configure and migrate Supabase

Authenticate and link from the repository root:

```powershell
pnpm.cmd exec supabase login
pnpm.cmd exec supabase link --project-ref <SUPABASE_PROJECT_ID>
pnpm.cmd exec supabase db push
```

`db push` applies the versioned files in `supabase/migrations`. Do not run `supabase db reset` against production; reset is destructive and intended for local development only. Do not seed the five demo stories into production unless the owner explicitly wants them published there.

In the Supabase dashboard:

- Confirm Email auth is enabled and public user signup is disabled.
- Set the Site URL to the final HTTPS origin.
- Add Vercel preview origins only if preview deployments need authentication; avoid an unrestricted wildcard in production.
- Confirm the `article-media` bucket exists, is public-read, and retains the migration's MIME/size policies.
- Review RLS policies for every `public` table and confirm the service-role key is not present in frontend settings.
- Enable database backups/PITR appropriate to the service tier and test restoration before launch.

Create the first administrator from a trusted local terminal. Put the production values in a temporary, ignored `.env.local`, run the script, and then remove the bootstrap password:

```powershell
pnpm.cmd create-admin
```

The script requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_DISPLAY_NAME`. The password must be at least 12 characters. If the address already exists, invite or promote it through a reviewed administrative database procedure rather than rerunning the create script.

## 3. Configure Resend

Verify the sending domain and set:

```text
RESEND_API_KEY=re_...
EMAIL_FROM=Topicora <hello@your-domain.example>
CONTACT_TO_EMAIL=editor@your-domain.example
```

The newsletter confirmation URL is built from `NEXT_PUBLIC_SITE_URL`. Test confirmation and contact delivery from a Vercel preview connected to a non-production Supabase project before enabling production traffic.

## 4. Configure Vercel

Use pnpm and the standard Next.js preset. Add these values under Project Settings → Environment Variables:

```text
NEXT_PUBLIC_SITE_NAME=Topicora
NEXT_PUBLIC_SITE_TAGLINE=Useful ideas, wherever curiosity leads.
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<browser-safe-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-key>
RESEND_API_KEY=<server-only-key>
EMAIL_FROM=Topicora <hello@your-domain.example>
CONTACT_TO_EMAIL=editor@your-domain.example
NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=true
NEXT_PUBLIC_SENTRY_DSN=<public-sentry-dsn>
SENTRY_DSN=<server-sentry-dsn>
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_AUTH_TOKEN=<server-only-token>
SENTRY_ORG=<sentry-organization-slug>
SENTRY_PROJECT=<sentry-project-slug>
CRON_SECRET=<at-least-32-random-characters>
```

Set the service-role, Resend, Sentry auth token, and cron secret as sensitive. Do not expose them with a `NEXT_PUBLIC_` prefix. `NEXT_PUBLIC_SENTRY_DSN` is intentionally browser-visible. Set `NEXT_PUBLIC_SITE_URL` separately for staging if staging is indexed behind a dedicated hostname; keep preview deployments blocked from search indexing at the platform level.

Vercel build settings:

```text
Install command: pnpm install --frozen-lockfile
Build command:   pnpm build
Output:          Next.js default
Node.js:         24.x (22.x or newer is supported)
```

## 5. Deploy and connect the domain

Deploy the main branch through Vercel. Add the production domain, configure DNS as Vercel directs, and wait for HTTPS issuance. Then update all of these to the exact final origin:

- Vercel `NEXT_PUBLIC_SITE_URL`
- Supabase Auth Site URL and allowed redirects
- Resend links/templates or allowlists, if configured
- Any canonical URLs imported with editorial content

Redeploy after changing a build-time public environment value.

`vercel.json` schedules the publication and newsletter campaign workers every minute. Vercel sends `Authorization: Bearer <CRON_SECRET>` when the project has `CRON_SECRET` configured; both routes reject missing or invalid credentials. Confirm both jobs appear under Project Settings -> Cron Jobs after deployment.

## 5a. Configure monitoring and edge protection

Create a Sentry Next.js project and provide the variables above. Use a token scoped only to source-map release uploads. Trigger a controlled server error in staging, confirm it reaches Sentry without cookies, form bodies, email addresses, or IP addresses, and then remove the test error.

The application proxy already rejects oversized, cross-site, and method-mismatched public mutations. Add platform rules in Vercel Firewall for volumetric protection:

- Rate-limit newsletter, contact, auth callback, staff invitation, and admin mutation paths.
- Enable bot protection or managed challenges for repeated abusive POST requests.
- Start custom rules in log-only mode, review legitimate traffic, and then switch them to deny or challenge.
- Exclude authenticated cron requests from broad bot rules while retaining the bearer-secret check.

## 6. Production smoke test

Before announcing launch, verify:

- `/`, `/articles`, a category, a tag, a seeded/imported article, and `/search` return 200.
- `/robots.txt`, `/sitemap.xml`, `/rss.xml`, and Open Graph images use the production hostname.
- An unauthenticated `/admin` request redirects to login.
- An administrator can create, preview, schedule, publish, edit, archive, and—if intended—delete a test article.
- The scheduled article remains hidden before its timestamp and appears afterward.
- An administrator can invite an editor; the invitation grants only the selected role and requires TOTP before protected work.
- Article edits create immutable revision snapshots, and restoring a revision creates a new snapshot instead of erasing history.
- The publication worker processes a due job and invalidates the related article and archive caches.
- Cover uploads reject disallowed type/size and require alt text.
- Newsletter signup remains pending until the confirmation link is used.
- A subscriber can update topics/frequency and unsubscribe through a signed preference link; one-click unsubscribe accepts POST.
- A test campaign can be drafted, segmented, scheduled, delivered once, and retried safely after a simulated failure.
- Contact submission is stored and delivered to the configured address.
- A controlled staging error appears in Sentry without sensitive request data, and Vercel Firewall rules challenge abusive traffic without blocking normal forms or cron jobs.
- Privacy, terms, disclaimer, editorial, corrections, and AI policy pages contain owner-approved legal/editorial text.
- Security headers appear on production responses and no secret appears in browser JavaScript or logs.

Run the repository gates before release:

```powershell
pnpm.cmd verify
pnpm.cmd exec supabase db lint --linked --level warning
```

The browser suite requires an isolated test Supabase project or the local Docker stack plus a disposable admin account:

```powershell
pnpm.cmd exec playwright install chromium
pnpm.cmd test:e2e
```

Never point destructive end-to-end tests at production.

## 7. CI setup

The default GitHub Actions job builds without database credentials and verifies formatting, lint, types, units, and compilation. To enable the optional browser job, define repository variable `RUN_E2E=true` and add these secrets for a dedicated test project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Protect `main` with required CI checks. Use Vercel preview deployments for review, but never connect preview browser tests to production data.

## 8. Rollback and recovery

Application rollback: promote the previously known-good Vercel deployment. Environment rollback: restore the previous value and redeploy.

Database migrations require explicit forward and rollback planning. Prefer additive changes, deploy code compatible with old and new schemas, backfill, then remove obsolete fields in a later release. For an emergency data recovery, use the Supabase backup/PITR workflow; do not improvise destructive SQL on the primary database.

Export critical editorial data on a schedule, test a restoration into a separate project, and document recovery time and recovery point objectives. Storage backups and external copies of licensed original media should be included in the continuity plan.

## Post-launch operations

- Add error monitoring and alerting (for example, Sentry) without collecting article drafts or form contents unnecessarily.
- Review Vercel, Supabase, Resend, and auth logs weekly during the launch period.
- Monitor database size, slow queries, rate-limit rejections, email bounces, and storage usage.
- Rotate privileged credentials on a schedule and immediately after staff/contractor changes.
- Review dependencies and Supabase migration advisories monthly.
