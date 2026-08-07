import type { Metadata } from "next";
import Link from "next/link";

import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Topicora collects, uses, protects, and retains personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Trust & privacy"
      title="Privacy Policy"
      intro="Topicora collects only the information needed to publish the site, operate its editorial tools, and respond to readers."
    >
      <h2>Information you provide</h2>
      <p>
        Newsletter signup stores your email address, consent wording, signup
        source, status, and relevant timestamps. The contact form stores your
        name, email, reason, subject, message, and any article URL you provide.
        Administrator accounts are managed through Supabase Auth.
      </p>
      <h2>Automatic information</h2>
      <p>
        When enabled, Vercel Web Analytics provides aggregated usage
        information. Our public site does not require a reader account.
        Essential authentication cookies are used only for the protected
        editorial dashboard. Hosting and security systems may process network
        information such as an IP address to deliver the site and prevent abuse.
      </p>
      <h2>How information is used</h2>
      <p>
        We use contact information to answer enquiries, investigate corrections,
        administer newsletter consent, secure forms, and maintain the
        publication. We do not sell personal information. Newsletter addresses
        are not available to anonymous site visitors or ordinary browser code.
      </p>
      <h2>Service providers</h2>
      <p>
        Supabase provides database, authentication, and image storage services.
        Vercel hosts the application and may provide analytics. Resend sends
        transactional email when configured. Each provider processes information
        under its own terms and security controls.
      </p>
      <h2>Retention and choices</h2>
      <p>
        Contact messages are retained while they are useful for correspondence,
        correction records, or reasonable business requirements. Newsletter
        records are retained to honour confirmation and unsubscribe status. You
        may request access, correction, or deletion where applicable by using
        the <Link href="/contact">contact form</Link>. Some records may be
        retained when required for security, legal, or audit purposes.
      </p>
      <h2>Security and changes</h2>
      <p>
        Topicora uses server-side validation, row-level database permissions,
        protected administrator routes, and restricted secrets. No system is
        perfectly secure. Material changes to this policy will be dated on this
        page.
      </p>
    </PolicyPage>
  );
}
