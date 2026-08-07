import {
  CalendarClock,
  FileText,
  FolderTree,
  Gauge,
  Inbox,
  Mail,
  KeyRound,
  LogOut,
  ScrollText,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/lib/actions/auth";

const links = [
  ["Dashboard", "/admin", Gauge],
  ["Articles", "/admin/articles", FileText],
  ["Schedule", "/admin/schedule", CalendarClock],
  ["Categories", "/admin/categories", FolderTree],
  ["Tags", "/admin/tags", Tags],
  ["Messages", "/admin/messages", Inbox],
  ["Subscribers", "/admin/subscribers", Users],
  ["Campaigns", "/admin/campaigns", Mail],
  ["Team", "/admin/team", KeyRound],
  ["Audit trail", "/admin/audit", ScrollText],
  ["Settings", "/admin/settings", Settings],
] as const;

export function AdminNav({ name, role }: { name: string; role: string }) {
  return (
    <aside className="border-border bg-surface border-b lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between p-5 lg:block">
        <Link href="/admin">
          <Image
            src="/logo.svg"
            alt="Topicora CMS"
            width={145}
            height={34}
            priority
            className="h-7 w-auto dark:invert"
          />
        </Link>
        <div className="mt-0 text-right lg:mt-6 lg:text-left">
          <p className="text-sm font-bold">{name}</p>
          <p className="text-muted-foreground text-xs capitalize">{role}</p>
        </div>
      </div>
      <nav
        className="border-border flex gap-1 overflow-x-auto border-t p-3 lg:block"
        aria-label="Administration"
      >
        {links.map(([label, href, Icon]) => (
          <Link
            className="hover:bg-muted flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold"
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <form
        action={logoutAction}
        className="border-border hidden border-t p-3 lg:block"
      >
        <button className="button-ghost w-full justify-start" type="submit">
          <LogOut aria-hidden="true" size={17} />
          Sign out
        </button>
      </form>
    </aside>
  );
}
