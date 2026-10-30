"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock, ArrowRight, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getCalendarItems } from "@/mocks/loader";
import type { CalendarItem } from "@/mocks/types";

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const { openSheet } = useDetailSheet();

  const [items, setItems] = React.useState<CalendarItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchCalendar = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getCalendarItems();
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-44 rounded-[22px]" />
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load compliance calendar." onRetry={fetchCalendar} />;
  }

  const overdueItems = items.filter((i) => i.daysLeft < 0);
  const upcomingItems = items.filter((i) => i.daysLeft >= 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--ny-muted)] mt-1">{t("subtitle")}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-[var(--ny-muted)] shadow-sm self-start sm:self-auto">
          Sample Statutory Schedule
        </span>
      </div>

      {/* 1. Overdue Items First (Per Spec) */}
      {overdueItems.length > 0 && (
        <Card className="p-0 border border-[var(--ny-status-red-border)] overflow-hidden rounded-[22px] shadow-sm">
          <div className="p-5 bg-[var(--ny-status-red-bg)] border-b border-[var(--ny-status-red-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-[var(--ny-status-red)] shrink-0" aria-hidden="true" />
              <h2 className="font-heading font-bold text-base text-[var(--ny-status-red)]">
                {t("overdueSection")} ({overdueItems.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-[var(--ny-status-red)] px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20">
              Immediate Action Required
            </span>
          </div>

          <div className="divide-y divide-[var(--ny-border)]">
            {overdueItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openSheet("calendar-item", item.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--ny-bg)] cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSheet("calendar-item", item.id);
                  }
                }}
                aria-label={`View overdue item ${item.title}`}
              >
                <div>
                  <h3 className="font-heading font-bold text-sm text-[var(--ny-text)]">{item.title}</h3>
                  <p className="text-xs text-[var(--ny-muted)] mt-0.5">
                    Original Due Date: {item.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusChip status="expired" label={`${Math.abs(item.daysLeft)} days overdue`} />
                  <span className="text-xs font-semibold text-[var(--ny-forest)] inline-flex items-center gap-1">
                    Resolve
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 2. Upcoming Deadlines */}
      <Card className="p-0 overflow-hidden rounded-[22px]">
        <div className="p-5 bg-[var(--ny-surface)] border-b border-[var(--ny-border)]">
          <h2 className="font-heading font-bold text-base text-[var(--ny-text)]">
            {t("upcomingSection")}
          </h2>
          <p className="text-xs text-[var(--ny-muted)] mt-0.5">
            Synchronized with statutory GST filing rules &amp; licence schedules
          </p>
        </div>

        {upcomingItems.length === 0 ? (
          <div className="p-6">
            <EmptyState message={t("emptyMonth")} />
          </div>
        ) : (
          <div className="divide-y divide-[var(--ny-border)]">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openSheet("calendar-item", item.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--ny-bg)] cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSheet("calendar-item", item.id);
                  }
                }}
                aria-label={`View deadline for ${item.title}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-[var(--ny-muted)]">
                      {item.category}
                    </span>
                    <span className="text-[var(--ny-border)]">•</span>
                    <h3 className="font-bold text-sm text-[var(--ny-text)]">{item.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--ny-muted)] mt-0.5">
                    Statutory Cutoff: {item.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusChip
                    status={item.daysLeft <= 30 ? "expiring" : "valid"}
                    label={item.daysLeft <= 30 ? `Due in ${item.daysLeft}d` : `${item.daysLeft}d left`}
                  />
                  <span className="text-xs font-semibold text-[var(--ny-forest)] inline-flex items-center gap-1">
                    Details
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
