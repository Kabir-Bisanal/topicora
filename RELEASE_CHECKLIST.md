# Topicora MVP Release Checklist

Verified locally on 7 August 2026 with Node.js, pnpm, Docker Desktop, local Supabase, and Playwright Chromium.

## Automated verification

- [x] Prettier check passes.
- [x] ESLint passes with zero warnings.
- [x] TypeScript check passes without emitting files.
- [x] Vitest: 9 files and 19 tests pass.
- [x] Next.js 16.3 production build compiles and generates all 61 route entries.
- [x] Playwright Chromium: all 8 public, search, auth, API, and admin workflow tests pass.
- [x] Supabase schema lint reports no errors in `public`, `private`, or `extensions`.
- [x] Local migrations reset and seed successfully.

## Product acceptance

- [x] Responsive public homepage, archive, taxonomy, search, article, contact, and trust pages.
- [x] Dark mode, keyboard focus, reduced-motion support, alt-text enforcement, and print styles.
- [x] Five long-form demo stories with meaningful categories/tags and unique editorial copy.
- [x] Protected administrator/editor dashboard and article lifecycle.
- [x] Drafts and future publications remain private under database RLS.
- [x] Signed 15-minute draft previews are non-indexable.
- [x] Validated contact and double-opt-in newsletter flows with anti-abuse controls.
- [x] RSS, sitemap, robots, manifest, JSON-LD, canonical metadata, and Open Graph output.
- [x] Security headers, sanitized Markdown, storage restrictions, and server-only privileged credentials.
- [x] Repeatable migrations, seed, CI, architecture, security, editorial, and deployment documentation.

## Owner actions before production

- [ ] Create separate production Supabase and Vercel projects.
- [ ] Configure the final domain and exact `NEXT_PUBLIC_SITE_URL` in Vercel and Supabase Auth.
- [ ] Apply migrations with `supabase db push`; do not reset the production database.
- [ ] Create the first production administrator with a unique password, then remove bootstrap credentials.
- [ ] Verify a Resend domain and configure sender/destination email values.
- [ ] Replace placeholder contact/legal details and have applicable policy text reviewed.
- [ ] Confirm backup/PITR, log retention, error monitoring, alerts, and incident ownership.
- [ ] Run the production smoke test in `DEPLOYMENT.md` before DNS cutover.

Production deployment is intentionally not performed by the local verification process because it requires the owner's accounts, final domain, production secrets, policy approval, and data-retention decisions.
