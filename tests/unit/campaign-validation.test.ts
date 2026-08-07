import { describe, expect, it } from "vitest";

import { campaignInputSchema } from "@/lib/validation/campaign";

describe("campaign validation", () => {
  const base = {
    subject: "A useful weekly note",
    preheader: null,
    contentMarkdown:
      "A substantive campaign body with enough editorial information.",
    targetTopicSlugs: ["technology-ai"],
    targetFrequency: "weekly" as const,
  };

  it("requires a timestamp for scheduled delivery", () => {
    expect(
      campaignInputSchema.safeParse({
        ...base,
        intent: "schedule",
        scheduledAt: null,
      }).success,
    ).toBe(false);
  });

  it("allows a draft without a delivery timestamp", () => {
    expect(
      campaignInputSchema.safeParse({
        ...base,
        intent: "draft",
        scheduledAt: null,
      }).success,
    ).toBe(true);
  });
});
