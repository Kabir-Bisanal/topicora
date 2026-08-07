import { z } from "zod";

export const articleStatusSchema = z.enum(["draft", "published", "archived"]);
export const disclosureSchema = z.enum([
  "none",
  "opinion",
  "financial",
  "affiliate",
  "sponsored",
  "ai_assisted",
]);

export const articleInputSchema = z
  .object({
    title: z.string().trim().min(5).max(180),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    excerpt: z.string().trim().min(20).max(500),
    contentMarkdown: z.string().trim().min(100),
    categoryId: z.uuid(),
    tagIds: z.array(z.uuid()).max(12),
    status: articleStatusSchema,
    disclosure: disclosureSchema,
    disclosureNote: z.string().trim().max(500).nullable(),
    isFeatured: z.boolean(),
    publishedAt: z.iso.datetime().nullable(),
    seoTitle: z.string().trim().max(70).nullable(),
    seoDescription: z.string().trim().max(170).nullable(),
    canonicalUrl: z.union([z.url(), z.null()]),
    coverImageAlt: z.string().trim().max(300).nullable(),
    coverImageCaption: z.string().trim().max(500).nullable(),
    existingCoverImageUrl: z.string().trim().max(1000).nullable(),
  })
  .superRefine((value, context) => {
    if (value.status === "published" && !value.publishedAt) {
      context.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: "Published articles need a publication date.",
      });
    }
    if (value.existingCoverImageUrl && !value.coverImageAlt) {
      context.addIssue({
        code: "custom",
        path: ["coverImageAlt"],
        message: "Cover-image alt text is required.",
      });
    }
    if (value.disclosure !== "none" && !value.disclosureNote) {
      context.addIssue({
        code: "custom",
        path: ["disclosureNote"],
        message: "Explain the selected disclosure.",
      });
    }
  });

export const articleIdSchema = z.uuid();

export type ArticleInput = z.infer<typeof articleInputSchema>;
