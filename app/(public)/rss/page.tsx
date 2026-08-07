import type { Metadata } from "next";
import { ArrowUpRight, Rss } from "lucide-react";
import Link from "next/link";

import { CopyFeedButton } from "@/components/rss/copy-feed-button";
import { Container } from "@/components/ui/container";
import { absoluteUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "RSS feed",
  description:
    "Follow Topicora in any RSS reader and receive new articles without an algorithmic feed.",
  alternates: { canonical: "/rss" },
};

export default function RssPage() {
  const feedUrl = absoluteUrl("/rss.xml");

  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-4xl">
        <p className="eyebrow">Topicora RSS</p>
        <h1 className="headline-lg mt-3">Read on your terms.</h1>
        <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-8">
          RSS delivers new Topicora articles directly to the reader app you
          choose. There is no algorithm, account, tracking feed, or inbox
          clutter.
        </p>
      </div>

      <section className="border-border bg-surface mt-10 max-w-4xl rounded-2xl border p-6 sm:p-9">
        <div className="flex items-start gap-4">
          <span className="bg-muted text-accent grid size-11 shrink-0 place-items-center rounded-full">
            <Rss aria-hidden="true" size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-2xl font-semibold">
              Topicora feed address
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Copy this address and paste it into Feedly, Inoreader,
              NetNewsWire, Reeder, or another RSS reader.
            </p>
          </div>
        </div>

        <div className="border-border bg-muted mt-6 rounded-xl border p-4">
          <code className="block text-sm leading-6 break-all">{feedUrl}</code>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <CopyFeedButton feedUrl={feedUrl} />
          <a
            className="button-secondary"
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            type="application/rss+xml"
          >
            View raw XML <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        </div>
        <p className="text-muted-foreground mt-4 text-xs leading-5">
          The raw XML is intentionally machine-readable. Most browsers display
          it as code; RSS apps turn it into a normal reading list.
        </p>
      </section>

      <section className="mt-14 max-w-4xl">
        <p className="eyebrow">How to subscribe</p>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Copy the feed address above."],
            ["2", "Open your preferred RSS reader and choose Add feed."],
            ["3", "Paste the address and confirm Topicora."],
          ].map(([number, instruction]) => (
            <li
              className="border-border rounded-xl border p-5 text-sm leading-6"
              key={number}
            >
              <span className="text-accent block text-xs font-extrabold">
                STEP {number}
              </span>
              <span className="mt-2 block">{instruction}</span>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground mt-7 text-sm leading-6">
          Prefer email? You can also subscribe through the newsletter form below
          or return to the <Link href="/articles">article archive</Link>.
        </p>
      </section>
    </Container>
  );
}
