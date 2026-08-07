import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/utils/slug";

describe("slugify", () => {
  it("normalizes punctuation, accents, spacing, and ampersands", () => {
    expect(slugify("  Café, Money & Work!  ")).toBe("cafe-money-and-work");
  });

  it("never leaves separator runs or edge hyphens", () => {
    expect(slugify("---How   AI??? Works---")).toBe("how-ai-works");
  });
});
