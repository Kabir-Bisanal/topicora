import { z } from "zod";

export const searchQuerySchema = z.string().trim().min(2).max(120);

export function normalizeSearchQuery(value: unknown) {
  const parsed = searchQuerySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
