import { z } from "zod";

export const loginSchema = z.object({ email: z.email(), password: z.string().min(8).max(200) });
export const statusUpdateSchema = z.object({ id: z.uuid(), status: z.string().trim().min(2).max(30) });
export const siteSettingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(180),
  redirects: z.string().trim().superRefine((value, context) => {
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) throw new Error();
      for (const item of parsed) {
        if (!item || typeof item !== "object" || !("from" in item) || !("to" in item)) throw new Error();
      }
    } catch {
      context.addIssue({ code: "custom", message: "Redirects must be a JSON array of { from, to } objects." });
    }
  }),
});
