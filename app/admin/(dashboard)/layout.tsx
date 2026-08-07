import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireStaff } from "@/lib/auth/server";

export const metadata: Metadata = { title: { default: "Editorial dashboard", template: "%s | Topicora CMS" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();
  return <div className="min-h-screen bg-background"><AdminNav name={profile.display_name} role={profile.role} /><main className="p-5 sm:p-8 lg:ml-64 lg:p-10">{children}</main></div>;
}
