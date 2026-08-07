import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";

const lifetimeSeconds = 15 * 60;

function secret() {
  return getServerEnv().SUPABASE_SERVICE_ROLE_KEY || null;
}

export function createPreviewToken(articleId: string) {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(
    JSON.stringify({
      articleId,
      expires: Math.floor(Date.now() / 1000) + lifetimeSeconds,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function validatePreviewToken(token: string, expectedArticleId: string) {
  const key = secret();
  if (!key) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", key)
    .update(payload)
    .digest("base64url");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  )
    return false;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { articleId?: string; expires?: number };
    return (
      parsed.articleId === expectedArticleId &&
      typeof parsed.expires === "number" &&
      parsed.expires >= Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}
