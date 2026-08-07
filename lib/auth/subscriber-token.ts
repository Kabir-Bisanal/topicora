import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";

function secret() {
  return getServerEnv().SUPABASE_SERVICE_ROLE_KEY || null;
}

export function createSubscriberToken(subscriberId: string) {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(
    JSON.stringify({ subscriberId, purpose: "newsletter-preferences", v: 1 }),
  ).toString("base64url");
  const signature = createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function validateSubscriberToken(token: string) {
  const key = secret();
  if (!key || token.length > 500) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  )
    return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { subscriberId?: unknown; purpose?: unknown; v?: unknown };
    return typeof parsed.subscriberId === "string" &&
      parsed.purpose === "newsletter-preferences" &&
      parsed.v === 1
      ? parsed.subscriberId
      : null;
  } catch {
    return null;
  }
}
