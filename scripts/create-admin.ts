import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env.local" });
config();

const input = z.object({
  url: z.url(),
  serviceRoleKey: z.string().min(20),
  email: z.email(),
  password: z.string().min(12),
  displayName: z.string().min(2),
});

async function main() {
  const parsed = input.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    displayName: process.env.ADMIN_DISPLAY_NAME ?? "Topicora Editor",
  });

  if (!parsed.success) {
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD (12+ characters), and ADMIN_DISPLAY_NAME before running create-admin.",
    );
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(parsed.data.url, parsed.data.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { display_name: parsed.data.displayName },
  });

  if (error || !data.user) throw error ?? new Error("User creation failed");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin", display_name: parsed.data.displayName })
    .eq("id", data.user.id);

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw profileError;
  }

  console.log(`Administrator created for ${parsed.data.email.toLowerCase()}.`);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String(error.message)
        : "Administrator setup failed.";
  console.error(message);
  process.exitCode = 1;
});
