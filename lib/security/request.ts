import { publicEnv } from "@/lib/env/public";

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = new URL(publicEnv.NEXT_PUBLIC_SITE_URL).origin;
  return origin === requestOrigin || origin === configuredOrigin;
}

export function requestFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "local";
  const agent = request.headers.get("user-agent")?.slice(0, 180) || "unknown";
  return `${ip}|${agent}`;
}
