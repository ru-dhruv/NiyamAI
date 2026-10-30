"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { PiggyBank, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
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
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-card" />
          <Skeleton className="h-56 rounded-card" />
          <Skeleton className="h-56 rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load tax savings suggestions." onRetry={fetchSavings} />;
  }

  const totalEstimated = savings.reduce((sum, item) => sum + item.estimatedRupees, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
        <p className="text-muted-size text-[var(--muted)] mt-1">{t("subtitle")}</p>
        <p className="text-muted-size text-[var(--muted)] italic mt-0.5">{t("disclaimer")}</p>
      </div>

      {/* Aggregate Banner */}
      <Card className="bg-[var(--brand-subtle)] border-[var(--border)] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-btn bg-[var(--panel)] border border-[var(--border)] flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-[var(--brand)]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-muted-size text-[var(--muted)] font-medium">
                Total Potential Savings Identified
              </span>
              <div className="text-title font-bold text-[var(--brand)] text-3xl">
                ₹{totalEstimated.toLocaleString("en-IN")}{" "}
                <span className="text-muted-size font-normal text-[var(--muted)]">(Estimate)</span>
              </div>
            </div>
          </div>
          <span className="text-muted-size px-3 py-1 bg-[var(--panel)] border border-[var(--border)] rounded-btn font-medium text-[var(--text)]">
            Review with your CA
          </span>
        </div>
      </Card>

      {/* 3 Seeded Opportunity Cards */}
      {savings.length === 0 ? (
        <EmptyState message={t("emptySavings")} icon={PiggyBank} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savings.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-size font-mono uppercase text-[var(--muted)]">
                    {item.category}
                  </span>
                  <span className="text-muted-size px-2 py-0.5 rounded-[4px] bg-[var(--status-amber-bg)] text-[var(--status-amber)] font-medium border border-[var(--status-amber-border)]">
                    {t("estimateLabel")}
                  </span>
                </div>
                <CardTitle className="text-body font-semibold text-[var(--text)] leading-snug">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-muted-size text-[var(--muted)] leading-relaxed">
                  {item.reason}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 border-t border-[var(--border)] mt-auto">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-size text-[var(--muted)]">Est. Benefit:</span>
                  <span className="text-title text-[var(--status-green)] font-bold">
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
