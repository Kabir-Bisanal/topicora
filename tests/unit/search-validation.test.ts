import { describe, expect, it } from "vitest";

import { normalizeSearchQuery } from "@/lib/validation/search";

describe("search query validation", () => {
  it("trims useful queries", () =>
    expect(normalizeSearchQuery("  viral claim ")).toBe("viral claim"));
  it("rejects tiny and oversized queries", () => {
    expect(normalizeSearchQuery("a")).toBeNull();
    expect(normalizeSearchQuery("x".repeat(121))).toBeNull();
  });
});
