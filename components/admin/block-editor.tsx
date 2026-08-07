"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Markdown } from "@/components/article/markdown";
import {
  blocksToMarkdown,
  parseContentBlocks,
  type ContentBlock,
  type ContentBlockType,
} from "@/lib/article/blocks";

const labels: Record<ContentBlockType, string> = {
  paragraph: "Paragraph",
  heading: "Section heading",
  quote: "Quotation",
  callout: "Callout",
  "bulleted-list": "Bulleted list",
  "numbered-list": "Numbered list",
  code: "Code block",
  divider: "Divider",
  markdown: "Markdown",
};

const types = Object.keys(labels) as ContentBlockType[];

export function BlockEditor({
  initialBlocks,
  fallbackMarkdown,
}: {
  initialBlocks?: unknown;
  fallbackMarkdown?: string;
}) {
  const [blocks, setBlocks] = useState(() =>
    parseContentBlocks(initialBlocks, fallbackMarkdown),
  );
  const [nextType, setNextType] = useState<ContentBlockType>("paragraph");
  const [preview, setPreview] = useState(false);
  const markdown = useMemo(() => blocksToMarkdown(blocks), [blocks]);
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  const updateBlock = (
    index: number,
    values: Partial<Pick<ContentBlock, "type" | "content">>,
  ) =>
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...values } : block,
      ),
    );

  const moveBlock = (index: number, direction: -1 | 1) =>
    setBlocks((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });

  const removeBlock = (index: number) =>
    setBlocks((current) =>
      current.length === 1
        ? [{ ...current[0], type: "paragraph", content: "" }]
        : current.filter((_, blockIndex) => blockIndex !== index),
    );

  const addBlock = () =>
    setBlocks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type: nextType,
        content: "",
      },
    ]);

  return (
    <div>
      <input
        type="hidden"
        name="content_blocks"
        value={JSON.stringify(blocks)}
      />
      <input type="hidden" name="content_markdown" value={markdown} />
      <input type="hidden" name="content_format" value="blocks" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Story blocks</p>
          <p className="text-muted-foreground text-xs">
            {blocks.length} blocks · {wordCount} words
          </p>
        </div>
        <button
          className="button-secondary min-h-9 px-3 py-1"
          type="button"
          onClick={() => setPreview((value) => !value)}
        >
          <Eye aria-hidden="true" size={15} />
          {preview ? "Edit blocks" : "Preview story"}
        </button>
      </div>
      {preview ? (
        <div className="border-border bg-background min-h-96 rounded-lg border p-5 sm:p-8">
          <Markdown
            content={markdown || "*Start writing to preview your article.*"}
          />
        </div>
      ) : (
        <div className="grid gap-3">
          {blocks.map((block, index) => (
            <article
              className="border-border bg-background rounded-lg border p-3 sm:p-4"
              key={block.id}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <GripVertical
                  className="text-muted-foreground"
                  aria-hidden="true"
                  size={17}
                />
                <label className="sr-only" htmlFor={`block-type-${block.id}`}>
                  Block type
                </label>
                <select
                  className="field min-h-9 w-auto py-1 text-sm font-bold"
                  id={`block-type-${block.id}`}
                  value={block.type}
                  onChange={(event) =>
                    updateBlock(index, {
                      type: event.target.value as ContentBlockType,
                    })
                  }
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {labels[type]}
                    </option>
                  ))}
                </select>
                <div className="ml-auto flex gap-1">
                  <button
                    className="button-ghost min-h-9 px-2"
                    type="button"
                    aria-label="Move block up"
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp aria-hidden="true" size={15} />
                  </button>
                  <button
                    className="button-ghost min-h-9 px-2"
                    type="button"
                    aria-label="Move block down"
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                  >
                    <ArrowDown aria-hidden="true" size={15} />
                  </button>
                  <button
                    className="button-ghost text-danger min-h-9 px-2"
                    type="button"
                    aria-label="Remove block"
                    onClick={() => removeBlock(index)}
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </button>
                </div>
              </div>
              {block.type === "divider" ? (
                <div className="border-border my-6 border-t" />
              ) : (
                <>
                  <label
                    className="sr-only"
                    htmlFor={`block-content-${block.id}`}
                  >
                    {labels[block.type]} content
                  </label>
                  <textarea
                    className={`field font-mono text-sm leading-6 ${
                      block.type === "markdown" || block.type === "code"
                        ? "min-h-72"
                        : "min-h-28"
                    }`}
                    id={`block-content-${block.id}`}
                    value={block.content}
                    onChange={(event) =>
                      updateBlock(index, { content: event.target.value })
                    }
                    placeholder={
                      block.type.includes("list")
                        ? "One item per line"
                        : `Write the ${labels[block.type].toLowerCase()}…`
                    }
                  />
                </>
              )}
            </article>
          ))}
          <div className="border-border bg-muted/40 flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3">
            <select
              className="field min-h-10 w-auto"
              value={nextType}
              onChange={(event) =>
                setNextType(event.target.value as ContentBlockType)
              }
              aria-label="New block type"
            >
              {types
                .filter((type) => type !== "markdown")
                .map((type) => (
                  <option key={type} value={type}>
                    {labels[type]}
                  </option>
                ))}
            </select>
            <button
              className="button-secondary"
              type="button"
              onClick={addBlock}
            >
              <Plus aria-hidden="true" size={16} /> Add block
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
