"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className="button-ghost size-11 p-0"
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      <Moon className="dark:hidden" aria-hidden="true" size={19} />
      <Sun className="hidden dark:block" aria-hidden="true" size={19} />
    </button>
  );
}
