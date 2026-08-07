import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Markdown } from "@/components/article/markdown";

describe("Markdown", () => {
  it("does not execute or render author-supplied script elements", () => {
    const { container } = render(
      <Markdown
        content={
          "# Safe\n\n<script>window.pwned = true</script>\n\n[Source](https://example.com)"
        }
      />,
    );
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("supports GFM tables without accepting raw form elements", () => {
    const { container } = render(
      <Markdown
        content={"| A | B |\n|---|---|\n| 1 | 2 |\n\n<form><input /></form>"}
      />,
    );
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });
});
