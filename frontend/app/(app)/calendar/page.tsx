"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Calendar as CalendarIcon, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load compliance calendar." onRetry={fetchCalendar} />;
  }

  const overdueItems = items.filter((i) => i.daysLeft < 0);
  const upcomingItems = items.filter((i) => i.daysLeft >= 0);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
        <p className="text-muted-size text-[var(--muted)] mt-1">{t("subtitle")}</p>
      </div>

      {/* 1. Overdue Items First (per spec) */}
      {overdueItems.length > 0 && (
        <Card className="p-0 border-[var(--status-red-border)] overflow-hidden">
          <div className="p-4 bg-[var(--status-red-bg)] border-b border-[var(--status-red-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[var(--status-red)] shrink-0" aria-hidden="true" />
              <h2 className="text-body font-semibold text-[var(--status-red)]">
                {t("overdueSection")} ({overdueItems.length})
              </h2>
            </div>
            <span className="text-muted-size font-medium text-[var(--status-red)]">Immediate Action Required</span>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {overdueItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openSheet("calendar-item", item.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--background)] cursor-pointer transition-colors"
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
                  <h3 className="text-body font-semibold text-[var(--text)]">{item.title}</h3>
                  <p className="text-muted-size text-[var(--muted)] mt-0.5">
                    Original Due Date: {item.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusChip status="expired" label={`${Math.abs(item.daysLeft)} days overdue`} />
                  <span className="text-muted-size font-medium text-[var(--brand)] inline-flex items-center gap-1">
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
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-[var(--panel)] border-b border-[var(--border)]">
          <h2 className="text-body font-semibold text-[var(--text)]">{t("upcomingSection")}</h2>
          <p className="text-muted-size text-[var(--muted)]">Synchronized with statutory GST and licence schedules</p>
        </div>

        {upcomingItems.length === 0 ? (
          <div className="p-6">
            <EmptyState message={t("emptyMonth")} />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openSheet("calendar-item", item.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--background)] cursor-pointer transition-colors"
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
                    <span className="text-muted-size font-mono uppercase text-[var(--muted)]">
                      {item.category}
                    </span>
                    <span className="text-[var(--border)]">•</span>
                    <h3 className="text-body font-medium text-[var(--text)]">{item.title}</h3>
                  </div>
                  <p className="text-muted-size text-[var(--muted)] mt-0.5">
                    Statutory Cutoff: {item.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusChip
                    status={item.daysLeft <= 30 ? "expiring" : "valid"}
                    label={item.daysLeft <= 30 ? `Due in ${item.daysLeft}d` : `${item.daysLeft}d left`}
                  />
                  <span className="text-muted-size font-medium text-[var(--brand)] inline-flex items-center gap-1">
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
