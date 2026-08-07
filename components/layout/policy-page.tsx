import { Container } from "@/components/ui/container";

export function PolicyPage({ eyebrow, title, intro, children, updated = "7 August 2026" }: { eyebrow: string; title: string; intro: string; children: React.ReactNode; updated?: string }) {
  return <Container className="py-12 sm:py-18"><header className="max-w-3xl"><p className="eyebrow">{eyebrow}</p><h1 className="headline-lg mt-3">{title}</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">{intro}</p><p className="mt-5 text-xs font-bold text-muted-foreground">Last updated: {updated}</p></header><div className="article-prose mt-12 max-w-(--reading-width)">{children}</div></Container>;
}
