import type { Metadata } from "next";

import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "General & Financial Disclaimer",
  description:
    "Important limitations on Topicora’s general, financial, medical, legal, and third-party information.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <PolicyPage
      eyebrow="Important context"
      title="General & Financial Disclaimer"
      intro="Topicora publishes educational and editorial information. It does not know your personal circumstances and cannot replace qualified professional advice."
    >
      <h2>General information</h2>
      <p>
        Articles are provided for general understanding and may simplify complex
        subjects. We aim for accuracy and correct material errors, but we do not
        guarantee that every article is complete, current, or suitable for a
        specific purpose.
      </p>
      <h2 id="financial">Financial disclaimer</h2>
      <p>
        Nothing on Topicora is investment, tax, accounting, or
        financial-planning advice, an offer, or a recommendation to buy or sell
        any security or product. Investing involves risk, including loss of
        capital. Examples are educational and may omit costs, taxes, liquidity
        needs, or personal constraints. Consider current primary documents and a
        suitably qualified adviser before acting.
      </p>
      <h2>Medical, legal, and safety information</h2>
      <p>
        Health, legal, and safety references are general information only. Do
        not use an article to diagnose a condition, ignore urgent help,
        interpret a legal obligation, or replace professional guidance. Rules
        and services vary by location and change over time.
      </p>
      <h2>External links</h2>
      <p>
        Links help readers inspect sources and context. Topicora does not
        control external sites and is not responsible for their availability,
        privacy practices, security, or later changes. A link is not necessarily
        an endorsement.
      </p>
      <h2>Disclosure labels</h2>
      <p>
        Opinion, financial, affiliate, sponsored, and AI-assisted articles carry
        visible disclosures. Those labels add context; they do not remove the
        reader’s need to evaluate evidence and suitability.
      </p>
    </PolicyPage>
  );
}
