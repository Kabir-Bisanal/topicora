import { describe, expect, it } from "vitest";

import {
  canAccessAdmin,
  canDeleteArticle,
  canEditArticle,
  canManageSettings,
} from "@/lib/auth/permissions";

describe("permission helpers", () => {
  it("keeps settings and permanent deletion admin-only", () => {
    expect(canManageSettings("admin")).toBe(true);
    expect(canManageSettings("editor")).toBe(false);
    expect(canDeleteArticle("author")).toBe(false);
  });

  it("allows editors broadly and authors only on their own article", () => {
    expect(canAccessAdmin("editor")).toBe(true);
    expect(canEditArticle("editor", "editor", "someone-else")).toBe(true);
    expect(canEditArticle("author", "author-1", "author-1")).toBe(true);
    expect(canEditArticle("author", "author-1", "author-2")).toBe(false);
  });
});
