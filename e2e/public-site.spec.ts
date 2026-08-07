import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const draftSlug = "playwright-private-draft";
let admin: SupabaseClient | null = null;

test.beforeAll(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  admin = createClient(url, key, { auth: { persistSession: false } });
  await admin.from("articles").upsert({
    id: "50000000-0000-4000-8000-000000000001",
    author_id: "11111111-1111-4111-8111-111111111111",
    category_id: "20000000-0000-4000-8000-000000000001",
    title: "Playwright Private Draft",
    slug: draftSlug,
    excerpt:
      "A private draft created only to verify public row-level security behavior.",
    content_markdown:
      "## Private\n\nThis draft must never be available through the public article route.",
    status: "draft",
    reading_time_minutes: 1,
  });
});

test.afterAll(async () => {
  await admin?.from("articles").delete().eq("slug", draftSlug);
});

test("homepage renders and primary navigation reaches the archive", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Ideas worth understanding/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: "All articles" }).first().click();
  await expect(page).toHaveURL(/\/articles/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Every useful idea/i }),
  ).toBeVisible();
});

test("a known published article opens with its reading tools", async ({
  page,
}) => {
  await page.goto("/articles/how-ai-assistants-are-changing-everyday-search");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "How AI Assistants Are Changing Everyday Search",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Table of contents" }),
  ).toContainText("Source verification");
  await expect(page.getByLabel("Share this article")).toBeVisible();
});

test("a database draft is inaccessible from the public article route", async ({
  page,
}) => {
  test.skip(
    !admin,
    "Supabase credentials are not configured; database draft check skipped.",
  );
  await page.goto(`/articles/${draftSlug}`);
  await expect(page.getByText("This trail ends here.")).toBeVisible();
});

test("unauthenticated visitors are redirected away from admin", async ({
  page,
}) => {
  await page.goto("/admin/articles");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("heading", { name: "Sign in to publish." }),
  ).toBeVisible();
});

test("newsletter and contact endpoints reject invalid input", async ({
  page,
}) => {
  await page.goto("/");
  const statuses = await page.evaluate(async () => {
    const newsletter = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid",
        consent: true,
        consentText: "I agree to receive Topicora’s newsletter.",
        source: "test",
        website: "",
        startedAt: Date.now() - 2000,
      }),
    });
    const contact = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "bad",
        reason: "unknown",
        articleUrl: "",
        subject: "No",
        message: "short",
        website: "",
        startedAt: Date.now() - 2000,
      }),
    });
    return [newsletter.status, contact.status];
  });
  expect(statuses).toEqual([400, 400]);
});

test("invalid newsletter preference links fail safely", async ({ page }) => {
  await page.goto("/newsletter/preferences?token=invalid");
  await expect(
    page.getByRole("heading", {
      name: "This preference link is unavailable",
    }),
  ).toBeVisible();
});
