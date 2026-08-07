# Topicora Security Guide

## Security model

Topicora assumes that public traffic, public form input, Markdown, image uploads, URLs, and browser state are untrusted. The primary protected assets are editorial drafts, author identities, subscriber addresses, contact messages, administrative capabilities, and server credentials.

Controls are layered across Next.js validation and authorization, Supabase Auth, PostgreSQL Row Level Security, storage policies, browser security headers, and operational secret management. Application authorization improves the user experience; RLS is the authoritative data boundary.

## Secrets

- Keep `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD`, access tokens, and deployment tokens server-only.
- Never prefix a secret with `NEXT_PUBLIC_`, print it in logs, commit `.env.local`, or expose it in error responses.
- Use separate Supabase projects and keys for preview/staging and production.
- Store production secrets in Vercel's encrypted environment settings and limit them to the necessary environments.
- Rotate the service-role key, Resend key, administrator password, and deployment tokens after suspected exposure. Existing preview tokens become invalid after service-key rotation.
- Remove `ADMIN_PASSWORD` from long-lived deployment environments after the bootstrap account is created unless CI browser tests explicitly require it.

## Authentication and sessions

Self-registration is disabled. Administrator accounts are created through the server-side bootstrap script, while subsequent users are invited from `/admin/team` through Supabase's server-only Auth Admin API. Session cookies are issued and refreshed by Supabase's SSR integration. Admin data access functions and Server Actions independently load the session profile and reject unauthorized roles.

Invited accounts are marked `mfa_required` and must enroll a TOTP authenticator. Sessions are checked for Supabase `aal2`; restrictive database policies deny protected operations when a required user remains at `aal1`. Existing bootstrap administrators should enable MFA at `/admin/security`. Review active users and revoke departed staff promptly. Do not share a common editor account.

## Row Level Security

RLS is enabled on every exposed public table. Anonymous users can read only published articles whose publication time has arrived, related public taxonomy, public author data, and public settings. Browser roles cannot directly insert subscribers or contact records; trusted server handlers perform those writes. Administrators and editors receive narrowly defined policies according to role helper functions.

The `private` schema and rate-limit table are revoked from `anon` and `authenticated`. The rate-limit function validates its inputs and is callable only by the service role. Run `pnpm exec supabase db lint --local --level warning` after every schema or policy change.

## Forms and abuse controls

The newsletter and contact APIs require a valid same-origin `Origin`, validate payloads with bounded Zod schemas, reject populated honeypots, require a plausible completion time, and apply a database-backed fingerprint limit. Newsletter confirmation stores a token hash rather than the bearer token.

These controls reduce commodity abuse but are not a complete DDoS defense. For a high-traffic launch, add Vercel Firewall or Cloudflare Turnstile, monitor rejection rates, and configure spend/rate alerts for Resend and Supabase.

Production Vercel projects should enable the bot managed ruleset and rate-limit `/api/contact`, `/api/newsletter`, `/admin/login`, sensitive Server Actions, and cron routes. The repository's proxy rejects oversized or cross-site public mutations before route execution, but platform WAF remains the correct control for traffic floods.

Avoid returning account-existence detail in newsletter responses. Contact data should have a documented retention period; delete resolved messages and inactive subscriber records when no longer required.

## Markdown, links, and redirects

Article Markdown passes through `rehype-sanitize` with an explicit schema. Raw author HTML is not rendered. Link protocols and attributes remain constrained by the sanitizer. Continue to treat any future embeds, iframes, custom components, and raw HTML as new threat surfaces requiring review.

Redirect settings accept only absolute internal paths, disallow protocol-relative URLs and `/admin` targets, and reject self-redirects. This prevents open redirects and accidental admin interception. Keep redirect rule editing administrator-only.

## Uploads

The `article-media` bucket has a 5 MiB object limit and restricts MIME types to common raster images. SVG is rejected because it can carry active content. Upload/update/delete policies require editorial roles. Use unpredictable object names, strip unnecessary image metadata before publication, and do not use the public bucket for confidential material.

If video, documents, or user uploads are added, create separate private buckets, perform malware scanning, and deliver them with expiring signed URLs.

## Browser and platform protections

`next.config.ts` applies a Content Security Policy, HSTS in production, clickjacking protection, MIME sniffing prevention, referrer restrictions, and a conservative permissions policy. Inline framework styles/scripts are accounted for; development-only allowances are not emitted in production. Preview and admin surfaces are excluded from indexing.

Keep `NEXT_PUBLIC_SITE_URL` exact. Same-origin checks recognize the request host for local/test ports but must not be treated as an authorization mechanism.

## Dependency and change management

- Keep the lockfile committed and install with `pnpm install --frozen-lockfile` in CI.
- Review Dependabot or equivalent pull requests, changelogs, and transitive security findings.
- Run `pnpm verify`, database lint, and Playwright before release.
- Apply migrations through source control. Never edit the production schema manually without immediately recording a matching migration.
- Protect the main branch and require CI plus human review for authentication, authorization, RLS, email, upload, and content-rendering changes.

## Monitoring and incident response

Configure Sentry before launch and connect Vercel/Supabase logs to alerting. Sentry initialization is disabled without a DSN and strips request bodies, cookies, user email, and IP values. Avoid logging contact bodies, subscriber emails, auth tokens, MFA secrets, or request cookies. Administrative events are written to an append-only audit table that intentionally excludes row snapshots and audience/contact PII.

For an incident:

1. Contain access by disabling affected accounts/endpoints and rotating relevant credentials.
2. Preserve Vercel, Supabase, Resend, and authentication logs.
3. Determine affected records and the exposure window.
4. Restore from a verified backup or roll back the application/migration as appropriate.
5. Notify affected people and authorities according to applicable law and policy.
6. Document root cause, corrective actions, and tests that prevent recurrence.

Before publishing this repository, replace this paragraph with a monitored security contact and disclosure policy. Do not ask reporters to include secrets or personal data in an initial report.
