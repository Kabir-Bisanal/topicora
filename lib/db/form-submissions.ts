import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

import { createAdminClient } from "@/lib/supabase/admin";

export async function saveContactMessage(message: {
  name: string;
  email: string;
  reason: string;
  articleUrl: string | null;
  subject: string;
  message: string;
}) {
  const supabase = createAdminClient();
  if (supabase) {
    const { error } = await supabase.from("contact_messages").insert({
      name: message.name,
      email: message.email,
      reason: message.reason,
      article_url: message.articleUrl,
      subject: message.subject,
      message: message.message,
    });
    if (!error) return { stored: true as const, location: "database" as const };
    if (process.env.NODE_ENV === "production")
      return { stored: false as const };
  }
  if (process.env.NODE_ENV === "production") return { stored: false as const };
  const directory = join(process.cwd(), "data");
  await mkdir(directory, { recursive: true });
  await appendFile(
    join(directory, "contact-messages.jsonl"),
    `${JSON.stringify({ ...message, createdAt: new Date().toISOString() })}\n`,
    "utf8",
  );
  return { stored: true as const, location: "local-file" as const };
}
