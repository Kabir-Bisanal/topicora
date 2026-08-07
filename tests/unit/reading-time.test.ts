import { describe, expect, it } from "vitest";

import { calculateReadingTime } from "@/lib/article/reading-time";

describe("calculateReadingTime", () => {
  it("uses 220 words per minute and rounds up", () => {
    expect(
      calculateReadingTime(Array.from({ length: 221 }, () => "word").join(" ")),
    ).toBe(2);
  });

  it("returns at least one minute for short or empty content", () => {
    expect(calculateReadingTime("")).toBe(1);
    expect(calculateReadingTime("A short note.")).toBe(1);
  });
});
