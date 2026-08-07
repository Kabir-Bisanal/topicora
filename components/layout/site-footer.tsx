import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";

const policyLinks = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Disclaimer", "/disclaimer"],
  ["Editorial policy", "/editorial-policy"],
  ["Corrections", "/corrections-policy"],
  ["AI assistance", "/ai-assistance-policy"],
];

export function SiteFooter() {
  return (
    <footer className="no-print border-border bg-surface mt-24 border-t py-12">
      <Container className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
        <div>
          <Image
            src="/logo.svg"
            alt="Topicora"
            width={160}
            height={36}
            className="h-8 w-auto dark:invert"
          />
          <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-6">
            Useful ideas, wherever curiosity leads. An India-first English
            publication for thoughtful, practical reading.
          </p>
        </div>
        <nav aria-label="Publication">
          <p className="eyebrow mb-3">Publication</p>
          <div className="grid gap-2 text-sm">
            <Link href="/articles">Article archive</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/rss.xml">RSS feed</Link>
          </div>
        </nav>
        <nav aria-label="Policies">
          <p className="eyebrow mb-3">Trust</p>
          <div className="grid gap-2 text-sm">
            {policyLinks.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </div>
        </nav>
        <div>
          <p className="eyebrow mb-3">A thoughtful inbox</p>
          <p className="text-muted-foreground mb-4 text-sm leading-6">
            Occasional new articles and practical reading notes. No daily noise.
          </p>
          <NewsletterForm />
        </div>
      </Container>
      <Container className="border-border text-muted-foreground mt-10 border-t pt-6 text-xs">
        © {new Date().getFullYear()} Topicora. Built for careful curiosity.
      </Container>
    </footer>
  );
}
