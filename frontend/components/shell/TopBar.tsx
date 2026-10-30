"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

interface TopBarProps {
  onMenuClick: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
  pageTitle?: string;
  overdueCount?: number;
}

export function TopBar({
  onMenuClick,
  menuButtonRef,
  pageTitle,
  overdueCount = 0,
}: TopBarProps) {
  const { user, ready } = useAuth();
  return (
    <header
      className={cn(
        "sticky top-0 h-16 flex items-center border-b border-[var(--ny-border)]",
        "bg-[var(--ny-surface)]/90 backdrop-blur-md px-4 sm:px-6 gap-3 z-[30] transition-colors"
      )}
    >
      {/* Left: menu + brand */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="text-[var(--ny-text)] hover:bg-[var(--ny-bg)] rounded-full"
        >
          {/* Hamburger icon */}
          <span className="flex flex-col gap-[5px] w-5" aria-hidden="true">
            <span className="h-0.5 w-5 bg-current rounded-full" />
            <span className="h-0.5 w-5 bg-current rounded-full" />
            <span className="h-0.5 w-5 bg-current rounded-full" />
          </span>
        </Button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-heading font-extrabold text-xl text-[var(--ny-forest-deep)] dark:text-white tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ny-forest)] rounded-full px-2 py-1"
          aria-label="NiyamAI — go to dashboard"
        >
          <span className="h-7 w-7 rounded-full bg-[var(--ny-forest)] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            N
          </span>
          <span>NiyamAI</span>
        </Link>
      </div>

      {/* Centre: page title — absolute so it doesn't affect side widths */}
      {pageTitle && (
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none max-w-[40%] truncate hidden sm:block">
          <span className="text-sm font-bold text-[var(--ny-text)] truncate font-heading tracking-tight">
            {pageTitle}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: bell + profile */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            overdueCount > 0
              ? `Notifications — ${overdueCount} due or overdue item${overdueCount > 1 ? "s" : ""}`
              : "Notifications — no items due"
          }
          className="relative text-[var(--ny-text)] hover:bg-[var(--ny-bg)] rounded-full"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {overdueCount > 0 && (
            <Badge
              variant="notification"
              className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
            >
              {overdueCount > 9 ? "9+" : overdueCount}
            </Badge>
          )}
        </Button>

        <Link href="/account" tabIndex={-1}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              ready && user
                ? `Account — ${user.name} (${user.role})`
                : "Open account menu"
            }
            className="rounded-full text-[var(--ny-text)] hover:bg-[var(--ny-bg)]"
          >
            <span
              className="h-8 w-8 rounded-full bg-[#e5f3ee] dark:bg-[#0d5b44]/30 border border-[var(--ny-border)] flex items-center justify-center text-xs font-bold text-[var(--ny-forest)]"
              aria-hidden="true"
            >
              {ready && user ? (
                user.role === "CA" ? "CA" : user.name.slice(0, 1).toUpperCase()
              ) : (
                <User className="h-4 w-4 text-[var(--ny-forest)]" />
              )}
            </span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
