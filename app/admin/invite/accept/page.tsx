import type { Metadata } from "next";

import { InviteAcceptForm } from "@/components/admin/invite-accept-form";

export const metadata: Metadata = {
  title: "Accept invitation | Topicora CMS",
  robots: { index: false, follow: false },
};

export default function AcceptInvitationPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-5 py-16">
      <section className="border-border bg-surface w-full rounded-xl border p-7 sm:p-9">
        <p className="eyebrow">Editorial invitation</p>
        <h1 className="headline-md mt-2">Join Topicora</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Create a strong password. You will set up an authenticator before the
          dashboard opens.
        </p>
        <InviteAcceptForm />
      </section>
    </main>
  );
}
