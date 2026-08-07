import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const slug = "automated-cms-draft-2026";
const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.ADMIN_EMAIL &&
  process.env.ADMIN_PASSWORD,
);

test("administrator can create a draft through the article form", async ({
  page,
}) => {
  test.skip(!configured, "Admin credentials and Supabase are not configured.");
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/articles/new");
  await page
    .getByLabel("Title", { exact: true })
    .fill("Automated CMS Draft 2026");
  await page
    .getByLabel("Excerpt")
    .fill(
      "A browser-created draft that verifies the complete protected publishing form.",
    );
  await page
    .getByLabel("Markdown content")
    .fill(
      "## A tested draft\n\nThis article is created by Playwright to verify authenticated server actions, validation, taxonomy selection, and the protected editorial workflow. It remains a draft and is removed after the test completes.",
    );
  await page
    .getByLabel("Category")
    .selectOption("20000000-0000-4000-8000-000000000001");
  await page.getByRole("button", { name: "Save article" }).click();
  await expect(page).toHaveURL(/\/admin\/articles\/[0-9a-f-]+\/edit\?saved=1/);
  await expect(page.getByText("Article saved successfully.")).toBeVisible();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data } = await admin
    .from("articles")
    .select("status,title")
    .eq("slug", slug)
    .single();
  expect(data).toMatchObject({
    status: "draft",
    title: "Automated CMS Draft 2026",
  });
  await admin.from("articles").delete().eq("slug", slug);
});
