import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getCurrentProfile } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Administrator login", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [profile, query] = await Promise.all([getCurrentProfile(), searchParams]);
  if (profile?.role === "admin" || profile?.role === "editor") redirect("/admin");
  const nextPath = query.next?.startsWith("/admin") ? query.next : "/admin";
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-xl sm:p-9">
        <Image src="/logo.svg" alt="Topicora" width={170} height={40} priority className="h-9 w-auto dark:invert" />
        <p className="eyebrow mt-9">Editorial access</p><h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Sign in to publish.</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">This area is restricted to Topicora administrators and editors.</p>
        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
