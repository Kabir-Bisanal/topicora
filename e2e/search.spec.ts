import { expect, test } from "@playwright/test";

test("search returns a known seeded article", async ({ page }) => {
  await page.goto("/search");
  await page
    .getByRole("searchbox", { name: "Search articles" })
    .fill("viral claim");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=viral\+claim|q=viral%20claim/);
  await expect(
    page.getByRole("link", {
      name: "How to Verify a Viral Claim Before Sharing It",
    }),
  ).toBeVisible();
});

test("search presents a useful empty state", async ({ page }) => {
  await page.goto("/search?q=zzzznonexistenttopic");
  await expect(
    page.getByRole("heading", { name: "No matching articles" }),
  ).toBeVisible();
});
