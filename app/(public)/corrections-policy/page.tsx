import type { Metadata } from "next";
import Link from "next/link";

import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: "How Topicora receives, investigates, and records corrections.",
  alternates: { canonical: "/corrections-policy" },
};

export default function CorrectionsPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Accountability"
      title="Corrections Policy"
      intro="Readers should be able to report a possible error easily and understand what Topicora does next."
    >
      <h2>Report an issue</h2>
      <p>
        Use the <Link href="/contact">contact form</Link>, select “Correction,”
        and include the article URL, the disputed wording, your proposed
        correction, and supporting primary or reliable sources. A clear report
        speeds up review, but we investigate good-faith notices even when a full
        source package is unavailable.
      </p>
      <h2>Review</h2>
      <p>
        The editorial desk checks the original source, publication context, and
        any new evidence. When specialist judgment is required, we seek an
        appropriate source rather than guessing. A request from a subject does
        not automatically produce a change, and criticism of an article’s
        conclusion is not by itself a factual correction.
      </p>
      <h2>What changes</h2>
      <p>
        Typographical fixes that do not change meaning may be made silently.
        Material factual errors, misleading omissions, or incorrect context are
        corrected promptly. The article’s updated date changes, and a note
        explains the substance when readers need it to understand the record.
      </p>
      <h2>Retractions</h2>
      <p>
        Retraction is reserved for work whose central reliability cannot be
        restored through correction. The original URL should remain available
        with a clear notice whenever legal, safety, and privacy considerations
        allow.
      </p>
      <h2>Appeals</h2>
      <p>
        If you believe the response missed relevant evidence, reply with the
        specific unresolved point and source. We reconsider the evidence without
        promising a preferred outcome.
      </p>
    </PolicyPage>
  );
}
