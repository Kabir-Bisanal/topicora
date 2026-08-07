import { describe, expect, it } from "vitest";

import {
  contactSchema,
  newsletterSchema,
  submittedAtHumanSpeed,
} from "@/lib/validation/public-forms";

describe("newsletter validation", () => {
  it("normalizes email addresses without weakening consent", () => {
    const value = newsletterSchema.parse({
      email: "  Reader@Example.COM ",
      consent: true,
      consentText: "I agree to receive the newsletter.",
      source: "footer",
      website: "",
      startedAt: 100,
    });
    expect(value.email).toBe("reader@example.com");
  });

  it("rejects missing consent and honeypot content", () => {
    expect(
      newsletterSchema.safeParse({
        email: "reader@example.com",
        consent: false,
        consentText: "I agree to receive the newsletter.",
        source: "footer",
        website: "",
        startedAt: 100,
      }).success,
    ).toBe(false);
    expect(
      newsletterSchema.safeParse({
        email: "reader@example.com",
        consent: true,
        consentText: "I agree to receive the newsletter.",
        source: "footer",
        website: "spam",
        startedAt: 100,
      }).success,
    ).toBe(false);
  });
});

describe("contact validation", () => {
  it("accepts the three documented reasons and meaningful messages", () => {
    expect(
      contactSchema.safeParse({
        name: "A Reader",
        email: "reader@example.com",
        reason: "correction",
        articleUrl: "https://example.com/article",
        subject: "A source needs review",
        message: "This is a detailed correction with enough context.",
        website: "",
        startedAt: 100,
      }).success,
    ).toBe(true);
  });

  it("rejects unsupported reasons, short messages, and implausibly fast submissions", () => {
    expect(
      contactSchema.safeParse({
        name: "A Reader",
        email: "reader@example.com",
        reason: "sales",
        articleUrl: "",
        subject: "Hello",
        message: "Too short",
        website: "",
        startedAt: 100,
      }).success,
    ).toBe(false);
    expect(submittedAtHumanSpeed(9_500, 10_000)).toBe(false);
    expect(submittedAtHumanSpeed(8_000, 10_000)).toBe(true);
  });
});
