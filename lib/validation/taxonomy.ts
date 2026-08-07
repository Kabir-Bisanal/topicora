import { z } from "zod";

export const categoryInputSchema = z.object({
  id: z.union([z.uuid(), z.literal("")]).optional(),
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(90),
  description: z.string().trim().min(20).max(300),
  sortOrder: z.coerce.number().int().min(0).max(100),
});

export const tagInputSchema = z.object({
  id: z.union([z.uuid(), z.literal("")]).optional(),
  name: z.string().trim().min(2).max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(70),
});
