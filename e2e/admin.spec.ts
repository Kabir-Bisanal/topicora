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
    .select("id,status,title,content_format,content_blocks")
    .eq("slug", slug)
    .single();
  expect(data).toMatchObject({
    status: "draft",
    title: "Automated CMS Draft 2026",
    content_format: "blocks",
  });
  const { count: revisions } = await admin
    .from("article_revisions")
    .select("id", { count: "exact", head: true })
    .eq("article_id", data!.id);
  expect(revisions).toBeGreaterThan(0);
  await admin.from("articles").delete().eq("slug", slug);
});

test("administrator can access governance and campaign tools", async ({
  page,
}) => {
  test.skip(!configured, "Admin credentials and Supabase are not configured.");
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/team");
  await expect(
    page.getByRole("heading", { name: "Team & invitations" }),
  ).toBeVisible();
  await page.goto("/admin/audit");
  await expect(
    page.getByRole("heading", { name: "Audit trail" }),
  ).toBeVisible();
  await page.goto("/admin/campaigns");
  await expect(
    page.getByRole("heading", { name: "Newsletter campaigns" }),
  ).toBeVisible();
  await page.goto("/admin/schedule");
  await expect(
    page.getByRole("heading", { name: "Scheduled publication queue" }),
  ).toBeVisible();
});

test("administrator can invite an MFA-required editor", async ({ page }) => {
  test.skip(!configured, "Admin credentials and Supabase are not configured.");
  const email = "playwright-editor@topicora.local";
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const existingUsers = await admin.auth.admin.listUsers();
  const existing = existingUsers.data.users.find(
    (user) => user.email === email,
  );
  if (existing) await admin.auth.admin.deleteUser(existing.id);
  await admin.from("staff_invitations").delete().eq("email", email);

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/team");
  await page.getByLabel("Display name").fill("Playwright Editor");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Role").selectOption("editor");
  await page.getByRole("button", { name: "Send invitation" }).click();
  await expect(
    page.getByText("Invitation sent. It expires in 24 hours."),
  ).toBeVisible();

  let invitedUserId = "";
  await expect
    .poll(async () => {
      const users = await admin.auth.admin.listUsers();
      invitedUserId =
        users.data.users.find((user) => user.email === email)?.id ?? "";
      return invitedUserId;
    })
    .not.toBe("");
  const { data: profile } = await admin
    .from("profiles")
    .select("role,mfa_required")
    .eq("id", invitedUserId)
    .single();
  expect(profile).toMatchObject({ role: "editor", mfa_required: true });

  await admin.auth.admin.deleteUser(invitedUserId);
  await admin.from("staff_invitations").delete().eq("email", email);
});

test("administrator can create a segmented campaign draft", async ({
  page,
}) => {
  test.skip(!configured, "Admin credentials and Supabase are not configured.");
  const subject = "Playwright editorial campaign";
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/campaigns/new");
  await page.getByLabel("Subject").fill(subject);
  await page
    .getByLabel("Preheader")
    .fill("A concise test of campaign creation.");
  await page
    .getByLabel("Markdown email")
    .fill(
      "## A useful dispatch\n\nThis browser-created campaign verifies segmentation, validation, and the durable newsletter workflow.",
    );
  await page.getByLabel("Technology & AI").check();
  await page.getByLabel("Frequency segment").selectOption("weekly");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/admin\/campaigns\/[0-9a-f-]+\/edit\?saved=1/);
  await expect(page.getByText("Campaign saved.")).toBeVisible();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data } = await admin
    .from("newsletter_campaigns")
    .select("id,status,target_frequency,target_topic_slugs")
    .eq("subject", subject)
    .single();
  expect(data).toMatchObject({
    status: "draft",
    target_frequency: "weekly",
    target_topic_slugs: ["technology-ai"],
  });
  if (data) await admin.from("newsletter_campaigns").delete().eq("id", data.id);
});
