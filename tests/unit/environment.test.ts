import { describe, expect, it } from "vitest";

import { parsePublicEnv, parseServerEnv } from "@/lib/env/schema";

describe("environment validation", () => {
  it("provides safe local defaults", () => {
    expect(parsePublicEnv({}).NEXT_PUBLIC_SITE_URL).toBe(
      "http://localhost:3000",
    );
  });

  it("rejects malformed public URLs and weak bootstrap passwords", () => {
    expect(() =>
      parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "not-a-url" }),
    ).toThrow();
    expect(() => parseServerEnv({ ADMIN_PASSWORD: "short" })).toThrow();
    expect(() => parseServerEnv({ CRON_SECRET: "short" })).toThrow();
  });
});
