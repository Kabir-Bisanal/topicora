import { z } from "zod";

export const staffInviteSchema = z.object({
  email: z.email().trim().toLowerCase(),
  displayName: z.string().trim().min(2).max(100),
  role: z.enum(["admin", "editor", "author"]),
});

export const staffUpdateSchema = z.object({
  id: z.uuid(),
  role: z.enum(["admin", "editor", "author"]),
  mfaRequired: z.boolean(),
});

export const invitationIdSchema = z.uuid();
