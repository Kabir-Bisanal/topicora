"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyFeedButton({ feedUrl }: { feedUrl: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyFeedUrl() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "copied"
      ? "RSS address copied"
      : status === "error"
        ? "Copy failed — select the address above"
        : "Copy RSS address";

  return (
    <button className="button-primary" type="button" onClick={copyFeedUrl}>
      {status === "copied" ? (
        <Check aria-hidden="true" size={17} />
      ) : (
        <Copy aria-hidden="true" size={17} />
      )}
      <span aria-live="polite">{label}</span>
    </button>
  );
}
