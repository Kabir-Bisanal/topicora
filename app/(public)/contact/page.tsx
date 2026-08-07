import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send Topicora general feedback, a correction, or a business enquiry.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-18">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <header>
          <p className="eyebrow">Contact Topicora</p>
          <h1 className="headline-lg mt-3">
            A direct line to the editorial desk.
          </h1>
          <p className="text-muted-foreground mt-6 text-lg leading-8">
            Send general feedback, report a correction, or discuss a business
            enquiry. Every valid submission is stored before email delivery is
            attempted.
          </p>
          <div className="border-border bg-muted mt-8 rounded-xl border p-5 text-sm leading-6">
            <strong>For corrections:</strong> include the article URL, the
            sentence or claim concerned, and a reliable source where possible.
            We review corrections independently of whether the original
            conclusion changes.
          </div>
        </header>
        <ContactForm />
      </div>
    </Container>
  );
}
