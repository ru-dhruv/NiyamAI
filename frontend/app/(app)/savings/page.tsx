"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { PiggyBank, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CountUp } from "@/components/ui/count-up";
import { getTaxSavings } from "@/mocks/loader";
import type { TaxSavingSuggestion } from "@/mocks/types";

export default function SavingsPage() {
  const t = useTranslations("savings");
  const [savings, setSavings] = React.useState<TaxSavingSuggestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchSavings = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getTaxSavings();
      setSavings(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-32 rounded-[22px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-[22px]" />
          <Skeleton className="h-56 rounded-[22px]" />
          <Skeleton className="h-56 rounded-[22px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load tax savings suggestions." onRetry={fetchSavings} />;
  }

  const totalEstimated = savings.reduce((sum, item) => sum + item.estimatedRupees, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-[var(--ny-muted)] mt-1">{t("subtitle")}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-[var(--ny-muted)] shadow-sm self-start sm:self-auto">
            Sample Proactive Opportunities
          </span>
        </div>
        <p className="text-xs text-[var(--ny-muted)] italic mt-2">{t("disclaimer")}</p>
      </div>

      {/* Aggregate Banner */}
      <Card className="bg-[#e5f3ee] dark:bg-[#0d5b44]/20 border border-[var(--ny-forest)]/30 p-7 rounded-[22px] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[var(--ny-forest)] text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ny-forest)]">
                Total Potential Savings Identified
              </span>
              <div className="text-4xl font-extrabold font-heading text-[var(--ny-forest-deep)] dark:text-white mt-1">
                <CountUp end={totalEstimated} prefix="₹" duration={1200} />
                <span className="text-xs font-semibold text-[var(--ny-muted)] ml-2">
                  (Indicative Benefit)
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-4 py-2 bg-[var(--ny-surface)] border border-[var(--ny-border)] rounded-full text-[var(--ny-text)] shadow-sm">
            Evaluate with your CA
          </span>
        </div>
      </Card>

      {/* Opportunity Cards */}
      {savings.length === 0 ? (
        <EmptyState message={t("emptySavings")} icon={PiggyBank} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savings.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between rounded-[22px] p-6 ny-lift shadow-sm">
              <CardHeader className="space-y-2 p-0 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase text-[var(--ny-muted)]">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--ny-status-amber-bg)] text-[var(--ny-status-amber)] border border-[var(--ny-status-amber-border)]">
                    {t("estimateLabel")}
                  </span>
                </div>
                <CardTitle className="font-heading font-bold text-base text-[var(--ny-text)] leading-snug">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs text-[var(--ny-muted)] leading-relaxed">
                  {item.reason}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4 border-t border-[var(--ny-border)] mt-auto">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[var(--ny-muted)]">Est. Benefit:</span>
                  <span className="text-xl font-extrabold font-heading text-[var(--ny-status-green)]">
                    +₹{item.estimatedRupees.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
