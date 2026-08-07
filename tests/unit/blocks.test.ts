import { describe, expect, it } from "vitest";

import { blocksToMarkdown, parseContentBlocks } from "@/lib/article/blocks";

describe("block editor serialization", () => {
  it("serializes structured blocks into portable Markdown", () => {
    expect(
      blocksToMarkdown([
        { id: "1", type: "heading", content: "A clear heading" },
        { id: "2", type: "bulleted-list", content: "First\nSecond" },
        { id: "3", type: "callout", content: "Verify the source." },
      ]),
    ).toBe(
      "## A clear heading\n\n- First\n- Second\n\n> **Note:** Verify the source.",
    );
  });

  it("preserves legacy Markdown in a safe fallback block", () => {
    expect(parseContentBlocks([], "## Existing story")).toEqual([
      {
        id: "legacy-markdown",
        type: "markdown",
        content: "## Existing story",
      },
    ]);
  });
});
