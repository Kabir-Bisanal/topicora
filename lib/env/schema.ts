import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url()]).optional();

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().trim().min(1).default("Topicora"),
  NEXT_PUBLIC_SITE_TAGLINE: z
    .string()
    .trim()
    .min(1)
    .default("Useful ideas, wherever curiosity leads."),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().optional(),
  NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z
    .string()
    .regex(/^(0(\.\d+)?|1(\.0+)?)$/)
    .default("0.1"),
});

export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().optional(),
  RESEND_API_KEY: z.string().trim().optional(),
  EMAIL_FROM: z.string().trim().default("Topicora <hello@example.com>"),
  CONTACT_TO_EMAIL: z.union([z.literal(""), z.email()]).optional(),
  ADMIN_EMAIL: z.union([z.literal(""), z.email()]).optional(),
  ADMIN_PASSWORD: z.union([z.literal(""), z.string().min(12)]).optional(),
  ADMIN_DISPLAY_NAME: z.string().trim().min(2).default("Topicora Editor"),
  SENTRY_DSN: optionalUrl,
  SENTRY_AUTH_TOKEN: z.string().trim().optional(),
  SENTRY_ORG: z.string().trim().optional(),
  SENTRY_PROJECT: z.string().trim().optional(),
  CRON_SECRET: z.string().trim().min(32).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parsePublicEnv(
  source: Record<string, string | undefined>,
): PublicEnv {
  return publicEnvSchema.parse(source);
}

export function parseServerEnv(
  source: Record<string, string | undefined>,
): ServerEnv {
  return serverEnvSchema.parse(source);
}
