"use client";

import * as React from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { TopBar } from "@/components/shell/TopBar";
import { NavDrawer } from "@/components/shell/NavDrawer";
import { DetailSheet, useDetailSheet, SheetType } from "@/components/shell/DetailSheet";
import { ChatBubbleSlot } from "@/components/shell/ChatBubbleSlot";
import { useLanguage } from "@/components/language-provider";

// Inner shell (uses useSearchParams and usePathname — wrapped in Suspense)
function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tNav = useTranslations("nav");
  const { locale, toggleLocale } = useLanguage();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  const { closeSheet } = useDetailSheet();
  const sheetType = (searchParams.get("sheet") as SheetType | null) ?? null;
  const sheetId = searchParams.get("id") ?? undefined;
  const sheetOpen = sheetType !== null;

  // Dynamically resolve page title from translations
  const pageTitle = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const seg = parts.length > 0 ? parts[0] : "dashboard";
    switch (seg) {
      case "dashboard":
        return tNav("dashboard");
      case "licences":
        return tNav("licences");
      case "invoices":
        return tNav("invoices");
      case "penalties":
        return tNav("penalties");
      case "ca":
        return tNav("ca");
      case "calendar":
        return tNav("calendar");
      case "savings":
        return tNav("savings");
      case "renewals":
        return tNav("renewals");
      case "account":
        return tNav("account");
      default:
        return "";
    }
  }, [pathname, tNav]);

  // Return focus to menu button when drawer closes
  const handleDrawerClose = React.useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => menuButtonRef.current?.focus(), 210);
  }, []);

  // ── Left-edge swipe gesture ──────────────────────────────────────────────
  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    const x = e.touches[0]?.clientX ?? 0;
    touchStartX.current = x <= 24 ? x : null;
  }, []);

  const handleTouchEnd = React.useCallback((e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? 0;
    if (endX - touchStartX.current > 60) setDrawerOpen(true);
    touchStartX.current = null;
  }, []);

  React.useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--ny-bg)] z-[0]">
      {/* Top bar — z-[30] */}
      <TopBar
        onMenuClick={() => setDrawerOpen(true)}
        menuButtonRef={menuButtonRef}
        pageTitle={pageTitle}
        overdueCount={2}
      />

      {/* Nav drawer — z-[50] */}
      <NavDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        businessName="Sharma Kirana & Food Mart"
        healthScore={62}
        onLanguageToggle={toggleLocale}
        currentLanguage={locale}
      />

      {/* Detail sheet — z-[60] */}
      <DetailSheet
        open={sheetOpen}
        sheetType={sheetType}
        sheetId={sheetId}
        onClose={closeSheet}
      />

      {/* Page content area: max-width 74rem (1184px), 24 px desktop / 16 px mobile padding */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 mx-auto w-full max-w-[74rem] px-4 md:px-8 py-8 focus-visible:outline-none"
      >
        {children}
      </main>

      {/* Chat bubble reserved slot — z-[40] */}
      <ChatBubbleSlot />
    </div>
  );
}

// Loading fallback (shown while Suspense resolves useSearchParams)
function AppShellFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--ny-bg)]">
      <div className="h-16 border-b border-[var(--ny-border)] bg-[var(--ny-surface)]" />
      <main className="flex-1 mx-auto w-full max-w-[74rem] px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<AppShellFallback>{children}</AppShellFallback>}>
      <AppShellInner>{children}</AppShellInner>
    </React.Suspense>
  );
}
