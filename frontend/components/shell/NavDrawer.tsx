"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  FileCheck2,
  FileText,
  ShieldAlert,
  BriefcaseMedical,
  CalendarDays,
  PiggyBank,
  RefreshCw,
  UserCircle,
  X,
  LogOut,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

interface NavItemConfig {
  href: string;
  translationKey:
    | "dashboard"
    | "licences"
    | "invoices"
    | "penalties"
    | "ca"
    | "calendar"
    | "savings"
    | "renewals"
    | "account";
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItemConfig[] = [
  { href: "/dashboard", translationKey: "dashboard", icon: LayoutDashboard },
  { href: "/licences", translationKey: "licences", icon: FileCheck2 },
  { href: "/invoices", translationKey: "invoices", icon: FileText },
  { href: "/penalties", translationKey: "penalties", icon: ShieldAlert, badge: 2 },
  { href: "/ca", translationKey: "ca", icon: BriefcaseMedical, badge: 1 },
  { href: "/calendar", translationKey: "calendar", icon: CalendarDays },
  { href: "/savings", translationKey: "savings", icon: PiggyBank },
  { href: "/renewals", translationKey: "renewals", icon: RefreshCw },
  { href: "/account", translationKey: "account", icon: UserCircle },
];

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  businessName?: string;
  healthScore?: number;
  onLanguageToggle: () => void;
  currentLanguage: string;
}

export function NavDrawer({
  open,
  onClose,
  businessName = "Sharma Kirana & Food Mart",
  healthScore = 62,
  onLanguageToggle,
  currentLanguage,
}: NavDrawerProps) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tDrawer = useTranslations("drawer");
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { user, isCA, ready, logout } = useAuth();

  // Trap focus inside the drawer when open
  React.useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    closeButtonRef.current?.focus();

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    drawer.addEventListener("keydown", handleKeyDown);
    return () => drawer.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock page scroll while open
  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const handleScrimClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* Scrim */}
      <div
        className={cn(
          "fixed inset-0 bg-[var(--ny-scrim)] z-[50] transition-opacity",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
          "[&]:motion-reduce:transition-none"
        )}
        style={{
          transitionDuration: open ? "250ms" : "200ms",
          transitionTimingFunction: open
            ? "cubic-bezier(0,0,0.2,1)"
            : "cubic-bezier(0.4,0,1,1)",
        }}
        aria-hidden="true"
        onClick={handleScrimClick}
      />

      {/* Drawer panel: Dark Green Deep Forest Background */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 left-0 h-full z-[50] flex flex-col",
          "w-[310px] max-w-[85vw] sm:max-w-[340px]",
          "bg-[var(--ny-forest-deep)] text-white border-r border-white/10 shadow-2xl",
          "transform transition-transform",
          "[&]:motion-reduce:transition-none [&]:motion-reduce:opacity-100",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          transitionDuration: open ? "250ms" : "200ms",
          transitionTimingFunction: open
            ? "cubic-bezier(0,0,0.2,1)"
            : "cubic-bezier(0.4,0,1,1)",
        }}
        inert={!open ? ("" as unknown as boolean) : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="bg-white/10 p-1 rounded-full shrink-0">
              <ScoreRing score={healthScore} size={44} strokeWidth={4} showSubtext={false} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white truncate leading-tight font-heading">
                  {ready && user ? user.name : businessName}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white shrink-0">
                  {ready && user ? user.role : "Owner"}
                </span>
              </div>
              <p className="text-xs text-[#86e2c3] leading-tight mt-1">
                {tDrawer("healthScoreLabel")}: <span className="font-bold text-white">{healthScore}/100</span>
              </p>
            </div>
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            aria-label={tDrawer("closeMenu")}
            onClick={onClose}
            className="shrink-0 ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Nav items */}
        <nav aria-label="Site navigation" className="flex-1 overflow-y-auto py-3 px-3">
          <ul role="list" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const label = tNav(item.translationKey);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86e2c3]",
                      "min-h-[44px]",
                      isActive
                        ? "bg-[var(--ny-forest)] text-white font-bold shadow-sm"
                        : "text-white/75 hover:text-white hover:bg-white/10 font-medium"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-white" : "text-white/60"
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge
                        variant="notification"
                        aria-label={`${item.badge} items`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-4 space-y-1 shrink-0 bg-black/10">
          {/* Language switch */}
          <Button
            variant="ghost"
            onClick={onLanguageToggle}
            className="w-full justify-start gap-3 text-white/80 hover:text-white hover:bg-white/10 min-h-[44px] rounded-full"
            aria-label={`Switch language to ${currentLanguage === "en" ? "Hindi" : "English"}`}
          >
            <Globe className="h-4 w-4 text-white/60 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold">
              {currentLanguage === "en" ? "EN · English" : "HI · हिंदी"}
            </span>
          </Button>

          {/* Theme switch */}
          <div className="flex items-center gap-3 px-3 min-h-[44px] text-white">
            <ThemeToggle className="w-full justify-start gap-3 text-white/80 hover:text-white hover:bg-white/10" />
          </div>

          {/* Sign out */}
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full justify-start gap-3 text-[#fca5a5] hover:text-[#fee2e2] hover:bg-red-950/40 min-h-[44px] rounded-full"
            aria-label={tNav("signOut")}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold">{tNav("signOut")}</span>
          </Button>
        </div>
      </div>
    </>
  );
}
