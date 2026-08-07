import type { Metadata } from "next";

import { MfaControl } from "@/components/admin/mfa-control";
import { requireStaff } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Account security | Topicora CMS",
  robots: { index: false, follow: false },
};

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const query = await searchParams;
  await requireStaff("/admin/security", { enforceMfa: false });
  const nextPath = query.next?.startsWith("/admin") ? query.next : "/admin";
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-16 sm:py-24">
      <p className="eyebrow">Account protection</p>
      <h1 className="headline-md mt-2">Multi-factor authentication</h1>
      <p className="text-muted-foreground mt-3 mb-8 leading-7">
        Topicora requires invited staff to confirm both their password and an
        authenticator code before accessing editorial data.
      </p>
      <MfaControl nextPath={nextPath} />
    </main>
  );
}
