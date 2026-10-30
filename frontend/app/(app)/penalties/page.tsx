"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, BookOpen, Scale, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getRules, getBusiness } from "@/mocks/loader";
import type { Rule, Business } from "@/mocks/types";

export default function PenaltiesPage() {
  const t = useTranslations("penalties");
  const { openSheet } = useDetailSheet();

  const [rules, setRules] = React.useState<Rule[]>([]);
  const [business, setBusiness] = React.useState<Business | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const loadPenaltiesData = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [rulesData, bizData] = await Promise.all([getRules(), getBusiness()]);
      setRules(rulesData);
      setBusiness(bizData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPenaltiesData();
  }, [loadPenaltiesData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-[22px]" />
        <Skeleton className="h-48 rounded-[22px]" />
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <ErrorState
        message="Could not load compliance rule directory."
        onRetry={loadPenaltiesData}
      />
    );
  }

  // Open lapses from current mock business profile
  const openLapses = [
    {
      lapse: "Commercial Premises Fire Safety NOC Expired",
      rule_code: "FIRE_NOC_EXPIRED",
      indicativePenalty: "₹25,000",
      penaltyDetail: "Sealing of premises plus indicative municipal compound penalty",
      severity: "High",
    },
    {
      lapse: "FSSAI Food Business Licence Expiring Within 20 Days",
      rule_code: "FSSAI_EXPIRING",
      indicativePenalty: "₹100/day",
      penaltyDetail: "Late filing penalty after expiry date",
      severity: "Medium",
    },
    {
      lapse: "Seller GSTIN Mod-36 Checksum Failure on INV-2026-041",
      rule_code: "GSTIN_INVALID",
      indicativePenalty: "₹8,100 ITC",
      penaltyDetail: "Disallowance of input credit under Sec 16(2)",
      severity: "High",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Guidance Notice */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-[var(--ny-muted)] mt-1">
              Deterministic statutory calculation rules and penalty triggers
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-[var(--ny-muted)] shadow-sm self-start sm:self-auto flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-[var(--ny-forest)]" />
            <span>Sample Data · Verified Rule Table</span>
          </span>
        </div>

        {/* Prominent Statutory Disclaimer */}
        <div className="mt-4 p-4 bg-[#e5f3ee] dark:bg-[#0d5b44]/20 border border-[var(--ny-forest)]/30 rounded-[20px] text-xs text-[var(--ny-text)] flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-[var(--ny-forest)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <span className="font-bold text-[var(--ny-forest)] block">
              Guidance, not legal or tax advice.
            </span>
            <p className="text-[var(--ny-muted)] leading-relaxed">
              All figures and formulas are based on publicly verified official central and state
              gazette notifications as of <strong className="font-semibold text-[var(--ny-text)]">2026-10-29</strong>.
              Penalty amounts are indicative sample assessments and must be reviewed with your Chartered Accountant.
            </p>
          </div>
        </div>
      </div>

      {/* Table 1: Open Lapses */}
      <Card className="p-0 overflow-hidden rounded-[22px]">
        <div className="p-5 border-b border-[var(--ny-border)] bg-[var(--ny-surface)] flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-[var(--ny-text)]">
              {t("openLapsesTitle")}
            </h2>
            <p className="text-xs text-[var(--ny-muted)] mt-0.5">{t("openLapsesSubtitle")}</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--ny-status-red-bg)] text-[var(--ny-status-red)] border border-[var(--ny-status-red-border)]">
            3 Active Lapses
          </span>
        </div>

        {openLapses.length === 0 ? (
          <div className="p-6">
            <EmptyState message={t("emptyLapses")} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-muted)] font-bold uppercase tracking-wider">
                  <th scope="col" className="p-4 pl-6">{t("tableHeadLapse")}</th>
                  <th scope="col" className="p-4">{t("tableHeadRuleCode")}</th>
                  <th scope="col" className="p-4">{t("tableHeadEstPenalty")}</th>
                  <th scope="col" className="p-4 pr-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ny-border)] text-xs">
                {openLapses.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => openSheet("penalty-rule", item.rule_code)}
                    className="hover:bg-[var(--ny-bg)] cursor-pointer transition-colors"
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSheet("penalty-rule", item.rule_code);
                      }
                    }}
                    aria-label={`View rule details for ${item.lapse}`}
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-sm text-[var(--ny-text)]">{item.lapse}</div>
                      <span className="text-[11px] text-[var(--ny-muted)]">{item.penaltyDetail}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-xs text-[var(--ny-forest)]">
                      {item.rule_code}
                    </td>
                    <td className="p-4 font-extrabold text-sm text-[var(--ny-status-red)]">
                      {item.indicativePenalty}
                      <span className="text-[10px] font-normal text-[var(--ny-muted)] block">
                        Indicative Sample
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="text-xs font-semibold text-[var(--ny-forest)] inline-flex items-center gap-1">
                        View Rule
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Table 2: Full Rules Directory */}
      <Card className="p-0 overflow-hidden rounded-[22px]">
        <div className="p-5 border-b border-[var(--ny-border)] bg-[var(--ny-surface)]">
          <h2 className="font-heading font-bold text-base text-[var(--ny-text)]">
            {t("rulesDirectoryTitle")}
          </h2>
          <p className="text-xs text-[var(--ny-muted)] mt-0.5">
            Canonical table of statutory compliance triggers, official references &amp; formulas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="table">
            <thead>
              <tr className="border-b border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-muted)] font-bold uppercase tracking-wider">
                <th scope="col" className="p-4 pl-6">Rule Title</th>
                <th scope="col" className="p-4">Rule Code</th>
                <th scope="col" className="p-4">{t("tableHeadLegalRef")}</th>
                <th scope="col" className="p-4">{t("tableHeadFormula")}</th>
                <th scope="col" className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ny-border)] text-xs">
              {rules.map((rule) => (
                <tr
                  key={rule.rule_code}
                  onClick={() => openSheet("penalty-rule", rule.rule_code)}
                  className="hover:bg-[var(--ny-bg)] cursor-pointer transition-colors"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openSheet("penalty-rule", rule.rule_code);
                    }
                  }}
                  aria-label={`View ${rule.title}`}
                >
                  <td className="p-4 pl-6 font-bold text-sm text-[var(--ny-text)] max-w-xs">
                    {rule.title}
                  </td>
                  <td className="p-4 font-mono font-bold text-xs text-[var(--ny-muted)]">
                    {rule.rule_code}
                  </td>
                  <td className="p-4 text-xs text-[var(--ny-muted)] max-w-xs leading-relaxed">
                    {rule.legal_reference}
                  </td>
                  <td className="p-4 text-xs text-[var(--ny-status-amber)] font-semibold max-w-xs leading-relaxed">
                    {rule.penalty_formula}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="text-xs font-semibold text-[var(--ny-forest)] inline-flex items-center gap-1">
                      Details
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
