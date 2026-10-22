"use client";

import { Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { DemoCategory } from "@/lib/demo/articles";

export function SiteHeader({ categories }: { categories: DemoCategory[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.removeAttribute("open");
    }
  }, [pathname]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        detailsRef.current &&
        detailsRef.current.hasAttribute("open") &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        detailsRef.current.removeAttribute("open");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="no-print border-header-border bg-header-bg/95 sticky top-0 z-40 border-b backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-17 max-w-(--content-width) items-center gap-4 px-5 sm:px-7">
        <Link
          href="/"
          className="mr-auto flex items-center"
          aria-label="Topicora home"
        >
          <Image
            src="/logo.svg"
            alt="Topicora"
            width={160}
            height={36}
            priority
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.svg"
            alt="Topicora"
            width={160}
            height={36}
            priority
            className="hidden h-8 w-auto dark:block"
          />
        </Link>
        <nav
          className="hidden items-center gap-5 lg:flex"
          aria-label="Primary navigation"
        >
          <Link
            className="hover:text-accent text-sm font-bold"
            href="/articles"
          >
            All articles
          </Link>
          {categories.map((category) => (
            <Link
              className="hover:text-accent text-sm font-bold"
              href={`/category/${category.slug}`}
              key={category.id}
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <Link
          className="button-ghost size-11 p-0"
          href="/search"
          aria-label="Search Topicora"
        >
          <Search aria-hidden="true" size={19} />
        </Link>
        <ThemeToggle />
        <details className="group relative lg:hidden" ref={detailsRef}>
          <summary
            className="button-ghost size-11 list-none p-0"
            aria-label="Open navigation menu"
          >
            <Menu aria-hidden="true" size={21} />
          </summary>
          <nav
            className="border-border bg-surface absolute top-13 right-0 w-[min(21rem,calc(100vw-2rem))] rounded-xl border p-3 shadow-2xl"
            aria-label="Mobile navigation"
          >
            <Link
              className="hover:bg-muted block rounded-lg px-3 py-3 font-bold"
              href="/articles"
            >
              All articles
            </Link>
            {categories.map((category) => (
              <Link
                className="hover:bg-muted block rounded-lg px-3 py-3 font-bold"
                href={`/category/${category.slug}`}
                key={category.id}
              >
                {category.name}
              </Link>
            ))}
            <div className="border-border mt-2 border-t pt-2">
              <Link
                className="hover:bg-muted block rounded-lg px-3 py-3 text-sm font-bold"
                href="/about"
              >
                About Topicora
              </Link>
              <Link
                className="hover:bg-muted block rounded-lg px-3 py-3 text-sm font-bold"
                href="/contact"
              >
                Contact
              </Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
