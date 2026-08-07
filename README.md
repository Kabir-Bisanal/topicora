# Topicora

Topicora is a production-minded editorial publishing platform built with Next.js, TypeScript, Tailwind CSS, Supabase, and Resend. It combines a fast public magazine experience with a role-protected editorial dashboard, full-text search, scheduled publishing, newsletter confirmation, contact handling, SEO feeds, and policy pages.

The repository includes five substantial demo articles, a repeatable database seed, local Supabase configuration, automated unit and browser tests, and a Vercel-ready deployment path.

## What is included

- Editorial homepage with a single featured story, latest articles, category navigation, topic chips, newsletter capture, dark mode, and responsive layouts.
- Article archive, category and tag pages, PostgreSQL full-text search, pagination, rich Markdown articles, table of contents, reading progress, disclosures, share links, related stories, and print styles.
- Protected admin dashboard for articles, categories, tags, subscribers, messages, redirects, and site settings.
- Draft, scheduled, published, and archived editorial workflows. Preview URLs are signed and expire after 15 minutes.
- Supabase Auth, Postgres, Row Level Security, and Storage with strict media policies.
- Double opt-in newsletter flow, validated contact form, anti-bot controls, database-backed rate limiting, and optional Resend delivery.
- Dynamic metadata, JSON-LD, Open Graph images, sitemap, robots, RSS, canonical URLs, security headers, and optional Vercel Analytics.

## Prerequisites

Install these once:

- [Node.js](https://nodejs.org/) 22 or newer (Node 24 LTS is used in CI).
- [pnpm](https://pnpm.io/) 11.20 or newer: `corepack enable && corepack prepare pnpm@11.20.0 --activate`.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) for the local Supabase stack.
- Git.

The Supabase CLI is a project dependency, so no global installation is required. On Windows PowerShell, use `pnpm.cmd` if execution policy blocks `pnpm.ps1`.

## Local setup

```powershell
git clone <repository-url> topicora
Set-Location topicora
pnpm.cmd install
Copy-Item .env.example .env.local
pnpm.cmd db:start
pnpm.cmd db:reset
pnpm.cmd create-admin
pnpm.cmd dev
```

After `pnpm db:start`, run `pnpm exec supabase status` and copy the API URL, anon key, and service-role key into `.env.local`. Add a unique admin email and a password of at least 12 characters before running `pnpm create-admin`.

Open:

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`
- Supabase Studio: `http://127.0.0.1:54323`
- Local email inbox: `http://127.0.0.1:54324`

The seed is safe to replay through `pnpm db:reset`. It creates the initial taxonomy, settings, and five requested demo articles. Resetting the local database removes local content and auth users, so recreate the admin afterward.

## Environment variables

| Variable                               | Scope       | Required          | Purpose                                                                                 |
| -------------------------------------- | ----------- | ----------------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_NAME`                | Public      | No                | Display and metadata name; defaults to Topicora.                                        |
| `NEXT_PUBLIC_SITE_TAGLINE`             | Public      | No                | Brand tagline.                                                                          |
| `NEXT_PUBLIC_SITE_URL`                 | Public      | Yes in production | Absolute canonical origin, without a trailing slash.                                    |
| `NEXT_PUBLIC_SUPABASE_URL`             | Public      | Yes               | Supabase project API URL.                                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`        | Public      | Yes               | Browser-safe Supabase publishable/anon key.                                             |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server only | Yes               | Admin operations, form writes, previews, and rate limiting. Never expose it to clients. |
| `RESEND_API_KEY`                       | Server only | Production email  | Sends confirmation and contact email.                                                   |
| `EMAIL_FROM`                           | Server only | Production email  | Verified sender identity.                                                               |
| `CONTACT_TO_EMAIL`                     | Server only | Contact delivery  | Destination for contact notifications.                                                  |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED` | Public      | No                | Set to `true` to load Vercel Analytics.                                                 |
| `ADMIN_EMAIL`                          | Script/CI   | Bootstrap only    | First administrator account.                                                            |
| `ADMIN_PASSWORD`                       | Script/CI   | Bootstrap only    | First administrator password, 12+ characters.                                           |
| `ADMIN_DISPLAY_NAME`                   | Script      | No                | Initial profile display name.                                                           |

`SUPABASE_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` support CLI/CI workflows but are not consumed by the application runtime.

## Commands

```text
pnpm dev             Start the Next.js development server
pnpm build           Create the production build
pnpm start           Serve the production build
pnpm format:check    Check formatting
pnpm lint            Run ESLint with zero warnings allowed
pnpm typecheck       Run TypeScript without emitting files
pnpm test            Run the Vitest unit suite
pnpm test:e2e        Run Playwright against an isolated port
pnpm verify          Run formatting, lint, types, units, and build
pnpm db:start        Start local Supabase containers
pnpm db:reset        Rebuild and seed the local database
pnpm db:push         Apply migrations to a linked Supabase project
pnpm create-admin    Create the first administrator from environment values
```

## Editorial workflow

1. Sign in at `/admin/login` with an administrator or editor account.
2. Create a story, assign its category and tags, and save it as a draft.
3. Use Preview to open a short-lived, signed URL that cannot be indexed.
4. Set a future publish time for scheduled release, or publish immediately.
5. Only published articles whose `published_at` is in the past appear publicly. The application invalidates affected pages after editorial changes.

Markdown is sanitized before rendering. Cover images require alt text. Article validation enforces title, excerpt, SEO, canonical, publication, and disclosure constraints.

## Project layout

```text
app/                  Next.js routes, route handlers, metadata, and admin UI
components/           Editorial, form, layout, SEO, and reusable UI components
lib/                  Auth, data access, validation, security, email, and utilities
supabase/migrations/  Versioned schema, policies, functions, and storage rules
supabase/seed.sql     Deterministic demo content
scripts/              Administrator and seed utilities
tests/unit/           Vitest unit tests
e2e/                  Playwright browser tests
.github/workflows/    Continuous integration
```

Next.js 16 uses `proxy.ts` for request-time session refresh and redirects; this replaces the older `middleware.ts` convention.

## Quality gates

Pull requests run formatting, ESLint, TypeScript, unit tests, and a production build. End-to-end CI is opt-in through the repository variable `RUN_E2E=true` and requires the Supabase/admin secrets listed in `.github/workflows/ci.yml`.

For architecture, security, editorial, and production instructions, see `ARCHITECTURE.md`, `SECURITY.md`, `EDITORIAL_GUIDE.md`, and `DEPLOYMENT.md`.

## License and ownership

No open-source license is included. Treat the source and editorial content as proprietary until the owner chooses and adds a license.
