import { describe, expect, it } from "vitest";

import { evaluateEdgeRequest } from "@/lib/security/edge-guard";

describe("edge request guard", () => {
  it("rejects oversized public form payloads before route execution", () => {
    expect(
      evaluateEdgeRequest({
        pathname: "/api/contact",
        method: "POST",
        contentLength: 25_001,
        fetchSite: "same-origin",
      }),
    ).toMatchObject({ allowed: false, status: 413 });
  });

  it("rejects cross-site mutations and allows unrelated routes", () => {
    expect(
      evaluateEdgeRequest({
        pathname: "/api/newsletter",
        method: "POST",
        contentLength: 100,
        fetchSite: "cross-site",
      }),
    ).toMatchObject({ allowed: false, status: 403 });
    expect(
      evaluateEdgeRequest({
        pathname: "/articles",
        method: "GET",
        contentLength: 0,
        fetchSite: null,
      }),
    ).toEqual({ allowed: true });
  });
});
