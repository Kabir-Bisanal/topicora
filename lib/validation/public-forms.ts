import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  consent: z.literal(true),
  consentText: z.string().trim().min(15).max(500),
  source: z.string().trim().min(2).max(80).default("website"),
  website: z.string().max(0),
  startedAt: z.coerce.number().int().positive(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  reason: z.enum(["general feedback", "correction", "business enquiry"]),
  articleUrl: z.union([z.literal(""), z.url().max(1000)]).transform((value) => value || null),
  subject: z.string().trim().min(5).max(160),
  message: z.string().trim().min(20).max(5000),
  website: z.string().max(0),
  startedAt: z.coerce.number().int().positive(),
});

export function submittedAtHumanSpeed(startedAt: number, now = Date.now()) {
  const elapsed = now - startedAt;
  return elapsed >= 1500 && elapsed <= 2 * 60 * 60 * 1000;
}
