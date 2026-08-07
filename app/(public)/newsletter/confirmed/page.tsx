import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Newsletter confirmation", robots: { index: false, follow: false } };

export default async function NewsletterConfirmedPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams; const confirmed = status === "confirmed";
  return <Container className="max-w-2xl py-24 text-center"><p className="eyebrow">Topicora newsletter</p><h1 className="headline-md mt-4">{confirmed ? "You’re confirmed." : "That confirmation link isn’t available."}</h1><p className="mt-5 text-muted-foreground">{confirmed ? "Your address is active. We’ll send only useful reading notes, and every message will include an unsubscribe option." : "The link may have expired, already been used, or the newsletter service may be unavailable. You can submit the signup form again."}</p><Link className="button-primary mt-8" href="/">Return home</Link></Container>;
}
