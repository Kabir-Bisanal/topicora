"use client";

import { Check, Copy, Linkedin, Mail, Sparkles } from "lucide-react";
import { useState } from "react";

export function ShareControls({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const openQuoteCard = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("topicora:open-quote-card"));
    }
  };
  return (
    <div
      className="no-print flex flex-wrap items-center gap-2"
      aria-label="Share this article"
    >
      <span className="text-muted-foreground mr-1 text-xs font-bold tracking-wider uppercase">
        Share
      </span>
      <button
        className="button-secondary gap-1.5"
        type="button"
        onClick={openQuoteCard}
        aria-label="Create editorial quote card"
      >
        <Sparkles aria-hidden="true" size={15} className="text-accent" />
        <span className="text-xs font-bold">Quote card</span>
      </button>
      <a
        className="button-secondary"
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
      <a
        className="button-secondary size-11 p-0"
        aria-label="Share on LinkedIn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Linkedin aria-hidden="true" size={17} />
      </a>
      <a
        className="button-secondary"
        href={`https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        X
      </a>
      <a
        className="button-secondary size-11 p-0"
        aria-label="Share by email"
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
      >
        <Mail aria-hidden="true" size={17} />
      </a>
      <button
        className="button-secondary size-11 p-0"
        type="button"
        onClick={copy}
        aria-label="Copy article link"
      >
        {copied ? (
          <Check aria-hidden="true" size={17} />
        ) : (
          <Copy aria-hidden="true" size={17} />
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
