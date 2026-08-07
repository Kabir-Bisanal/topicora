import { z } from "zod";

export const campaignIdSchema = z.uuid();

export const campaignInputSchema = z
  .object({
    subject: z.string().trim().min(5).max(160),
    preheader: z.string().trim().max(200).nullable(),
    contentMarkdown: z.string().trim().min(20).max(100_000),
    targetTopicSlugs: z
      .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
      .max(30),
    targetFrequency: z.enum(["weekly", "monthly"]).nullable(),
    intent: z.enum(["draft", "schedule", "send"]),
    scheduledAt: z.iso.datetime().nullable(),
  })
  .superRefine((value, context) => {
    if (value.intent === "schedule" && !value.scheduledAt)
      context.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Choose a delivery time.",
      });
  });
