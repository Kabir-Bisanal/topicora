import { FileText, FolderTree, Gauge, Inbox, LogOut, Settings, Tags, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/lib/actions/auth";

const links = [
  ["Dashboard", "/admin", Gauge],
  ["Articles", "/admin/articles", FileText],
  ["Categories", "/admin/categories", FolderTree],
  ["Tags", "/admin/tags", Tags],
  ["Messages", "/admin/messages", Inbox],
  ["Subscribers", "/admin/subscribers", Users],
  ["Settings", "/admin/settings", Settings],
] as const;

export function AdminNav({ name, role }: { name: string; role: string }) {
  return (
    <aside className="border-b border-border bg-surface lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between p-5 lg:block">
        <Link href="/admin"><Image src="/logo.svg" alt="Topicora CMS" width={145} height={34} className="h-7 w-auto dark:invert" /></Link>
        <div className="mt-0 text-right lg:mt-6 lg:text-left"><p className="text-sm font-bold">{name}</p><p className="text-xs text-muted-foreground capitalize">{role}</p></div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border p-3 lg:block" aria-label="Administration">
        {links.map(([label, href, Icon]) => <Link className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted" href={href} key={href}><Icon aria-hidden="true" size={18} />{label}</Link>)}
      </nav>
      <form action={logoutAction} className="hidden border-t border-border p-3 lg:block"><button className="button-ghost w-full justify-start" type="submit"><LogOut aria-hidden="true" size={17} />Sign out</button></form>
    </aside>
  );
}
