import { z } from "zod";

export const contentBlockTypeSchema = z.enum([
  "paragraph",
  "heading",
  "quote",
  "callout",
  "bulleted-list",
  "numbered-list",
  "code",
  "divider",
  "markdown",
]);

export const contentBlockSchema = z.object({
  id: z.string().trim().min(1).max(80),
  type: contentBlockTypeSchema,
  content: z.string().max(30_000),
});

export const contentBlocksSchema = z.array(contentBlockSchema).min(1).max(200);

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type ContentBlockType = z.infer<typeof contentBlockTypeSchema>;

const prefixLines = (content: string, prefix: string) =>
  content
    .split(/\r?\n/)
    .map((line) => `${prefix}${line.replace(/^[-*+\d.)\s]+/, "")}`)
    .join("\n");

export function blockToMarkdown(block: ContentBlock) {
  const content = block.content.trim();
  switch (block.type) {
    case "heading":
      return `## ${content}`;
    case "quote":
      return prefixLines(content, "> ");
    case "callout":
      return `> **Note:** ${content}`;
    case "bulleted-list":
      return prefixLines(content, "- ");
    case "numbered-list":
      return content
        .split(/\r?\n/)
        .map(
          (line, index) => `${index + 1}. ${line.replace(/^[-*+\d.)\s]+/, "")}`,
        )
        .join("\n");
    case "code":
      return `\`\`\`\n${content}\n\`\`\``;
    case "divider":
      return "***";
    case "paragraph":
    case "markdown":
      return content;
  }
}

export function blocksToMarkdown(blocks: ContentBlock[]) {
  return blocks.map(blockToMarkdown).filter(Boolean).join("\n\n").trim();
}

export function parseContentBlocks(
  value: unknown,
  fallbackMarkdown = "",
): ContentBlock[] {
  if (Array.isArray(value)) {
    const parsed = contentBlocksSchema.safeParse(value);
    if (parsed.success && parsed.data.length) return parsed.data;
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = contentBlocksSchema.safeParse(JSON.parse(value));
      if (parsed.success && parsed.data.length) return parsed.data;
    } catch {
      // The caller receives the safe Markdown fallback below.
    }
  }
  return [
    {
      id: "legacy-markdown",
      type: "markdown",
      content: fallbackMarkdown,
    },
  ];
}
