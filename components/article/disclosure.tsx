import { BadgeInfo } from "lucide-react";

import type { DisclosureType } from "@/lib/demo/articles";

const labels: Record<Exclude<DisclosureType, "none">, string> = {
  opinion: "Opinion",
  financial: "Financial content",
  affiliate: "Affiliate disclosure",
  sponsored: "Sponsored content",
  ai_assisted: "AI-assistance disclosure",
};

export function Disclosure({
  type,
  note,
}: {
  type: DisclosureType;
  note: string | null;
}) {
  if (type === "none") return null;
  return (
    <aside
      className="border-border bg-muted my-8 flex gap-3 rounded-xl border p-4 text-sm leading-6"
      aria-label={labels[type]}
    >
      <BadgeInfo
        className="text-accent mt-0.5 shrink-0"
        aria-hidden="true"
        size={20}
      />
      <div>
        <strong>{labels[type]}.</strong> {note}
      </div>
    </aside>
  );
}
