import { revalidatePath } from "next/cache";

import { canAccessAdmin } from "@/lib/auth/permissions";
import { getCurrentProfile } from "@/lib/auth/server";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || !canAccessAdmin(profile.role)) return Response.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { path?: unknown };
  const path = typeof body.path === "string" && body.path.startsWith("/") && !body.path.startsWith("//") ? body.path.slice(0, 300) : "/";
  revalidatePath(path);
  return Response.json({ ok: true, path });
}
