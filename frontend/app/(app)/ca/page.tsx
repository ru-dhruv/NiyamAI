"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Briefcase, MessageSquare, ArrowRight, Flag as FlagIcon, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getFlags } from "@/mocks/loader";
import type { Flag } from "@/mocks/types";

export default function CaWorkspacePage() {
  const t = useTranslations("ca");
  const { openSheet } = useDetailSheet();

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
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-64 rounded-card" />
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
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
          <p className="text-muted-size text-[var(--muted)] mt-1">{t("subtitle")}</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--background)] border border-[var(--border)] rounded-btn self-start sm:self-auto" role="tablist">
          {(["all", "open", "needs-info", "resolved"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={filter === tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-muted-size rounded-btn font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                filter === tab
                  ? "bg-[var(--panel)] text-[var(--brand)] border border-[var(--border)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
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

      {/* Flag List */}
      {filteredFlags.length === 0 ? (
        <EmptyState
          message={t("emptyFlags")}
          actionLabel={t("flagItemButton")}
          onAction={() => openSheet("flag", "flag_001")}
          icon={Briefcase}
        />
      ) : (
        <Card className="p-0 overflow-hidden divide-y divide-[var(--border)]">
          {filteredFlags.map((flag) => (
            <div
              key={flag.id}
              onClick={() => openSheet("flag", flag.id)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[var(--background)] transition-colors active:bg-[var(--background)]"
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
                  <span className="text-muted-size font-mono text-[var(--muted)]">
                    Ref: {flag.itemRef}
                  </span>
                </div>
                <p className="text-body font-medium text-[var(--text)]">{flag.note}</p>
                <div className="flex items-center gap-3 text-muted-size text-[var(--muted)] pt-1">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    {flag.comments.length} comment{flag.comments.length === 1 ? "" : "s"}
                  </span>
                  <span>•</span>
                  <span>Created {new Date(flag.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <span className="text-muted-size font-medium text-[var(--brand)] inline-flex items-center gap-1">
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
