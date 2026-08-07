import { BadgeInfo } from "lucide-react";

import type { DisclosureType } from "@/lib/demo/articles";

const labels: Record<Exclude<DisclosureType, "none">, string> = {
  opinion: "Opinion",
  financial: "Financial content",
  affiliate: "Affiliate disclosure",
  sponsored: "Sponsored content",
  ai_assisted: "AI-assistance disclosure",
};

export function Disclosure({ type, note }: { type: DisclosureType; note: string | null }) {
  if (type === "none") return null;
  return (
    <aside className="my-8 flex gap-3 rounded-xl border border-border bg-muted p-4 text-sm leading-6" aria-label={labels[type]}>
      <BadgeInfo className="mt-0.5 shrink-0 text-accent" aria-hidden="true" size={20} />
      <div><strong>{labels[type]}.</strong> {note}</div>
    </aside>
  );
}
