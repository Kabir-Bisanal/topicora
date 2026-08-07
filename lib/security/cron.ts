import { timingSafeEqual } from "node:crypto";

export function authorizeCronRequest(
  request: Request,
  configuredSecret: string | undefined,
) {
  if (!configuredSecret || configuredSecret.length < 32) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${configuredSecret}`;
  const received = Buffer.from(authorization);
  const target = Buffer.from(expected);
  return received.length === target.length && timingSafeEqual(received, target);
}
