import { describe, expect, it } from "vitest";

import { demoArticles, demoAuthor } from "@/lib/demo/articles";
import { articleMetadata } from "@/lib/seo/metadata";

describe("article metadata", () => {
  it("builds canonical, Open Graph, X, author, and keyword metadata", () => {
    const article = { ...demoArticles[0], author: demoAuthor };
    const metadata = articleMetadata(article);
    expect(metadata.alternates?.canonical).toContain(
      `/articles/${article.slug}`,
    );
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      title: article.seoTitle,
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.authors).toEqual([{ name: demoAuthor.displayName }]);
    expect(metadata.keywords).toContain("search");
  });
});
