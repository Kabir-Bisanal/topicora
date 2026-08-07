import type { TocItem } from "@/lib/markdown/toc";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="rounded-xl border border-border bg-surface p-5" aria-label="Table of contents">
      <p className="eyebrow mb-3">In this article</p>
      <ol className="grid gap-2 text-sm">
        {items.map((item) => (
          <li className={item.level === 3 ? "pl-4" : ""} key={item.id}>
            <a className="text-muted-foreground hover:text-accent" href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
