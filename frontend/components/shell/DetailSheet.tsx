"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LicenceDetailBody,
  AddLicenceDetailBody,
  InvoiceDetailBody,
  PenaltyRuleDetailBody,
  FlagDetailBody,
  CalendarItemDetailBody,
} from "./DetailSheetBodies";

// ── Allowed sheet types ───────────────────────────────────────────────────────
export type SheetType =
  | "licence"
  | "add-licence"
  | "invoice"
  | "penalty-rule"
  | "flag"
  | "calendar-item";

interface DetailSheetProps {
  /** Whether this sheet is currently visible */
  open: boolean;
  sheetType: SheetType | null;
  sheetId?: string;
  /** Called when the sheet should close (caller updates URL) */
  onClose: () => void;
  /** Whether there are unsaved edits — if true, closing prompts confirmation */
  hasUnsavedEdits?: boolean;
}

export function DetailSheet({
  open,
  sheetType,
  sheetId,
  onClose,
  hasUnsavedEdits = false,
}: DetailSheetProps) {
  const tSheet = useTranslations("sheet");
  const tCommon = useTranslations("common");
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus close button when sheet opens
  React.useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusable = sheet.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
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

    sheet.addEventListener("keydown", handleKeyDown);
    return () => sheet.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    if (hasUnsavedEdits) {
      const confirmed = window.confirm(tSheet("unsavedWarning"));
      if (!confirmed) return;
    }
    onClose();
  }

  const getTitle = () => {
    switch (sheetType) {
      case "licence":
        return tSheet("licenceTitle");
      case "add-licence":
        return tSheet("addLicenceTitle");
      case "invoice":
        return tSheet("invoiceTitle");
      case "penalty-rule":
        return tSheet("penaltyRuleTitle");
      case "flag":
        return tSheet("flagTitle");
      case "calendar-item":
        return tSheet("calendarItemTitle");
      default:
        return "";
    }
  };

  const title = getTitle();

  function renderBody() {
    switch (sheetType) {
      case "licence":
        return <LicenceDetailBody id={sheetId} />;
      case "add-licence":
        return <AddLicenceDetailBody />;
      case "invoice":
        return <InvoiceDetailBody id={sheetId} />;
      case "penalty-rule":
        return <PenaltyRuleDetailBody id={sheetId} />;
      case "flag":
        return <FlagDetailBody id={sheetId} />;
      case "calendar-item":
        return <CalendarItemDetailBody id={sheetId} />;
      default:
        return null;
    }
  }

  return (
    <>
      {/* Scrim */}
      <div
        className={cn(
          "fixed inset-0 bg-[var(--ny-scrim)] z-[60] transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          "[&]:motion-reduce:transition-none"
        )}
        style={{
          transitionDuration: open ? "250ms" : "200ms",
          transitionTimingFunction: open ? "cubic-bezier(0,0,0.2,1)" : "cubic-bezier(0.4,0,1,1)",
        }}
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Detail panel"}
        className={cn(
          "fixed top-0 right-0 h-full z-[60] flex flex-col shadow-2xl",
          /* Desktop: 480 px fixed; mobile: full width */
          "w-full sm:w-[480px]",
          "bg-[var(--ny-surface)] border-l border-[var(--ny-border)]",
          "transform transition-transform",
          "[&]:motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          transitionDuration: open ? "250ms" : "200ms",
          transitionTimingFunction: open ? "cubic-bezier(0,0,0.2,1)" : "cubic-bezier(0.4,0,1,1)",
        }}
        inert={!open ? ("" as unknown as boolean) : undefined}
      >
        {/* Sticky header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--ny-border)] shrink-0 bg-[var(--ny-surface)]">
          {/* Back arrow on mobile, X on desktop */}
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            aria-label={tSheet("closeSheet")}
            onClick={handleClose}
            className="text-[var(--ny-text)] rounded-full hover:bg-[var(--ny-bg)]"
          >
            {/* ArrowLeft on small screens, X on sm+ */}
            <ArrowLeft className="h-5 w-5 sm:hidden" aria-hidden="true" />
            <X className="h-5 w-5 hidden sm:block" aria-hidden="true" />
          </Button>
          <h2 className="font-heading font-bold text-base text-[var(--ny-text)] flex-1 truncate">{title}</h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {sheetType ? renderBody() : null}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t border-[var(--ny-border)] px-5 py-4 flex justify-end gap-3 bg-[var(--ny-bg)]">
          <Button variant="secondary" onClick={handleClose} className="rounded-full">
            {tCommon("close")}
          </Button>
        </div>
      </div>
    </>
  );
}

// ── URL-synced hook (safe for any page without CSR bailout) ───────────────────
export function useDetailSheet() {
  const router = useRouter();
  const pathname = usePathname();

  function openSheet(type: SheetType, id?: string) {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    params.set("sheet", type);
    if (id) params.set("id", id);
    else params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  }

  function closeSheet() {
    router.back();
  }

  return { openSheet, closeSheet };
}
