import { describe, expect, it } from "vitest";

import { isCurrentlyPublished } from "@/lib/article/publication";

const now = new Date("2026-08-07T12:00:00.000Z");

describe("isCurrentlyPublished", () => {
  it("allows published articles whose date has arrived", () => {
    expect(
      isCurrentlyPublished(
        { status: "published", publishedAt: "2026-08-07T11:59:00.000Z" },
        now,
      ),
    ).toBe(true);
  });

  it("keeps drafts, archives, and scheduled articles private", () => {
    expect(
      isCurrentlyPublished({ status: "draft", publishedAt: null }, now),
    ).toBe(false);
    expect(
      isCurrentlyPublished(
        { status: "archived", publishedAt: "2026-08-01T00:00:00.000Z" },
        now,
      ),
    ).toBe(false);
    expect(
      isCurrentlyPublished(
        { status: "published", publishedAt: "2026-08-08T00:00:00.000Z" },
        now,
      ),
    ).toBe(false);
  });
});
