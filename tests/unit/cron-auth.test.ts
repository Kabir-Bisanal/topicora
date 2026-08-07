import { describe, expect, it } from "vitest";

import { authorizeCronRequest } from "@/lib/security/cron";

describe("cron authorization", () => {
  const secret = "a-secure-cron-secret-that-is-long-enough";

  it("accepts only the exact bearer credential", () => {
    expect(
      authorizeCronRequest(
        new Request("https://topicora.example/api/cron/publish", {
          headers: { authorization: `Bearer ${secret}` },
        }),
        secret,
      ),
    ).toBe(true);
    expect(
      authorizeCronRequest(
        new Request("https://topicora.example/api/cron/publish", {
          headers: { authorization: "Bearer wrong" },
        }),
        secret,
      ),
    ).toBe(false);
  });

  it("fails closed when the configured secret is missing or weak", () => {
    const request = new Request("https://topicora.example/api/cron/publish");
    expect(authorizeCronRequest(request, undefined)).toBe(false);
    expect(authorizeCronRequest(request, "short")).toBe(false);
  });
});
