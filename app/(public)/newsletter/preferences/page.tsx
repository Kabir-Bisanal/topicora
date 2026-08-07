import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterPreferencesForm } from "@/components/forms/newsletter-preferences-form";
import { Container } from "@/components/ui/container";
import { getAllCategories } from "@/lib/db/articles";
import { getSubscriberPreferences } from "@/lib/db/newsletter";

export const metadata: Metadata = {
  title: "Newsletter preferences",
  robots: { index: false, follow: false },
};

export default async function NewsletterPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; welcome?: string }>;
}) {
  const query = await searchParams;
  const [subscriber, categories] = await Promise.all([
    getSubscriberPreferences(query.token ?? ""),
    getAllCategories(),
  ]);
  return (
    <Container className="max-w-3xl py-20">
      <p className="eyebrow">Your Topicora newsletter</p>
      <h1 className="headline-md mt-3">
        {query.welcome ? "Subscription confirmed." : "Email preferences"}
      </h1>
      <p className="text-muted-foreground mt-4 mb-8 max-w-2xl leading-7">
        Choose the ideas and cadence that are useful to you. Topicora stores
        only the preferences needed to deliver the newsletter.
      </p>
      {subscriber && query.token ? (
        <NewsletterPreferencesForm
          token={query.token}
          email={subscriber.email}
          status={subscriber.status}
          categories={categories}
          selectedTopics={subscriber.topic_slugs}
          frequency={subscriber.frequency}
        />
      ) : (
        <div className="border-border bg-surface rounded-xl border p-7">
          <h2 className="font-serif text-2xl font-semibold">
            This preference link is unavailable
          </h2>
          <p className="text-muted-foreground mt-3">
            It may be invalidated by a security-key rotation. Use a link from a
            recent Topicora email or contact the editorial team.
          </p>
          <Link className="button-primary mt-6" href="/">
            Return home
          </Link>
        </div>
      )}
    </Container>
  );
}
