"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <span className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
          <span className="text-xs font-semibold">Light</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-[var(--ny-muted)]" aria-hidden="true" />
          <span className="text-xs font-semibold">Dark</span>
        </span>
      )}
    </Button>
  );
}
