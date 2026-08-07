import { slugify } from "@/lib/utils/slug";

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function extractTableOfContents(markdown: string): TocItem[] {
  const seen = new Map<string, number>();
  return markdown
    .split("\n")
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const text = match[2]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_`~]/g, "")
        .trim();
      const base = slugify(text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return {
        id: count ? `${base}-${count}` : base,
        text,
        level: match[1].length as 2 | 3,
      };
    });
}
