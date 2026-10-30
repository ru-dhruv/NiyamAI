"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Briefcase, MessageSquare, ArrowRight, CheckCircle2, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getFlags } from "@/mocks/loader";
import { useAuth } from "@/lib/auth";
import type { Flag } from "@/mocks/types";

export default function CaWorkspacePage() {
  const t = useTranslations("ca");
  const { openSheet } = useDetailSheet();
  const { isCA, user, ready } = useAuth();

  const [flags, setFlags] = React.useState<Flag[]>([]);
  const [filter, setFilter] = React.useState<"all" | "open" | "needs-info" | "resolved">("all");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchFlags = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getFlags();
      setFlags(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load CA collaboration items." onRetry={fetchFlags} />;
  }

  const filteredFlags = flags.filter((f) => {
    if (filter === "all") return true;
    return f.status === filter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
              {t("title")}
            </h1>
            {ready && isCA && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e5f3ee] text-[var(--ny-forest)] border border-[var(--ny-forest)]/30">
                CA Portal
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--ny-muted)] mt-1">{t("subtitle")}</p>
        </div>

        {/* Filter Pills */}
        <div
          className="flex items-center gap-1.5 p-1 bg-[var(--ny-bg)] border border-[var(--ny-border)] rounded-full self-start sm:self-auto shadow-sm"
          role="tablist"
        >
          {(["all", "open", "needs-info", "resolved"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={filter === tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 text-xs rounded-full font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ny-forest)] ${
                filter === tab
                  ? "bg-[var(--ny-forest)] text-white shadow-sm"
                  : "text-[var(--ny-muted)] hover:text-[var(--ny-text)]"
              }`}
            >
              {tab === "all"
                ? t("filterAll")
                : tab === "open"
                ? t("filterOpen")
                : tab === "needs-info"
                ? t("filterNeedsInfo")
                : t("filterResolved")}
            </button>
          ))}
        </div>
      </div>

      {/* Role Banner */}
      <div className="p-4 rounded-[20px] bg-[var(--ny-surface)] border border-[var(--ny-border)] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#e5f3ee] text-[var(--ny-forest)] flex items-center justify-center font-bold text-xs">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--ny-text)]">
              {isCA ? "Advisor Active: CA Rajesh Verma (Fellow Chartered Accountant)" : "Client Active: Ramesh Sharma (Owner)"}
            </p>
            <p className="text-[11px] text-[var(--ny-muted)]">
              {isCA
                ? "Review flagged compliance lapses, provide statutory recommendations, and update status."
                : "Your CA has real-time access to flagged invoices, tax computations, and licence audits."}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[var(--ny-muted)] hidden md:block">
          Bhopal Practice
        </span>
      </div>

      {/* Flag List */}
      {filteredFlags.length === 0 ? (
        <EmptyState
          message={t("emptyFlags")}
          actionLabel={!isCA ? t("flagItemButton") : undefined}
          onAction={!isCA ? () => openSheet("flag", "flag_001") : undefined}
          icon={Briefcase}
        />
      ) : (
        <Card className="p-0 overflow-hidden rounded-[22px] divide-y divide-[var(--ny-border)]">
          {filteredFlags.map((flag) => (
            <div
              key={flag.id}
              onClick={() => openSheet("flag", flag.id)}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[var(--ny-bg)] transition-colors active:bg-[var(--ny-bg)]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openSheet("flag", flag.id);
                }
              }}
              aria-label={`View flag ${flag.id}`}
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <StatusChip status={flag.status} />
                  <span className="text-xs font-mono font-bold text-[var(--ny-muted)]">
                    Ref: {flag.itemRef}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[var(--ny-text)] leading-relaxed">
                  {flag.note}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--ny-muted)] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    {flag.comments.length} advice thread item{flag.comments.length === 1 ? "" : "s"}
                  </span>
                  <span>•</span>
                  <span>Created {flag.createdAt ? flag.createdAt.substring(0, 10) : ""}</span>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <span className="text-xs font-bold text-[var(--ny-forest)] inline-flex items-center gap-1">
                  Open Thread
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
