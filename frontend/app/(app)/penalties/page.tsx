"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ShieldCheck, ArrowRight, BookOpen, AlertOctagon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <Skeleton className="h-20 rounded-card" />
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (error || !business) {
    return <ErrorState message="Could not load compliance rule directory." onRetry={loadPenaltiesData} />;
  }

  // Open lapses from current mock business profile
  const openLapses = [
    {
      lapse: "Commercial Premises Fire Safety NOC Expired",
      rule_code: "FIRE_NOC_EXPIRED",
      indicativePenalty: "₹15,000 (estimated late regularisation)",
      severity: "high",
    },
    {
      lapse: "FSSAI Food Business Licence Expiring Within 20 Days",
      rule_code: "FSSAI_EXPIRING",
      indicativePenalty: "₹100/day after expiry date",
      severity: "medium",
    },
    {
      lapse: "Seller GSTIN Mod-36 Checksum Failure on INV-2026-041",
      rule_code: "GSTIN_INVALID",
      indicativePenalty: "₹10,000 or input credit disallowance",
      severity: "high",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
        {/* Verification note required by spec */}
        <div className="mt-2 p-3 bg-[var(--brand-subtle)] border border-[var(--border)] rounded-card text-muted-size text-[var(--text)] flex items-start gap-2.5">
          <BookOpen className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-semibold text-[var(--brand)]">Regulatory Guidance Notice: </span>
            <span>
              This information serves as compliance guidance and does NOT constitute formal legal or tax advice. All statutory rules and penalty formulas were verified against official central and state notifications as of <strong className="font-semibold">2026-10-29</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Table 1: Open Lapses */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--panel)]">
          <h2 className="text-body font-semibold text-[var(--text)]">{t("openLapsesTitle")}</h2>
          <p className="text-muted-size text-[var(--muted)]">{t("openLapsesSubtitle")}</p>
        </div>

        {openLapses.length === 0 ? (
          <div className="p-6">
            <EmptyState message={t("emptyLapses")} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)] text-muted-size text-[var(--muted)] font-medium">
                  <th scope="col" className="p-4">{t("tableHeadLapse")}</th>
                  <th scope="col" className="p-4">{t("tableHeadRuleCode")}</th>
                  <th scope="col" className="p-4">{t("tableHeadEstPenalty")}</th>
                  <th scope="col" className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-body">
                {openLapses.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => openSheet("penalty-rule", item.rule_code)}
                    className="hover:bg-[var(--background)] cursor-pointer transition-colors"
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
                    <td className="p-4">
                      <div className="font-semibold text-[var(--text)]">{item.lapse}</div>
                    </td>
                    <td className="p-4 font-mono text-muted-size text-[var(--muted)]">
                      {item.rule_code}
                    </td>
                    <td className="p-4 text-[var(--status-red)] font-semibold text-muted-size">
                      {item.indicativePenalty}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-muted-size font-medium text-[var(--brand)] inline-flex items-center gap-1">
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
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--panel)]">
          <h2 className="text-body font-semibold text-[var(--text)]">{t("rulesDirectoryTitle")}</h2>
          <p className="text-muted-size text-[var(--muted)]">
            Canonical table of statutory compliance triggers and formulas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="table">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)] text-muted-size text-[var(--muted)] font-medium">
                <th scope="col" className="p-4">Rule Title</th>
                <th scope="col" className="p-4">Rule Code</th>
                <th scope="col" className="p-4">{t("tableHeadLegalRef")}</th>
                <th scope="col" className="p-4">{t("tableHeadFormula")}</th>
                <th scope="col" className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-body">
              {rules.map((rule) => (
                <tr
                  key={rule.rule_code}
                  onClick={() => openSheet("penalty-rule", rule.rule_code)}
                  className="hover:bg-[var(--background)] cursor-pointer transition-colors"
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
                  <td className="p-4 font-semibold text-[var(--text)] max-w-xs">{rule.title}</td>
                  <td className="p-4 font-mono text-muted-size text-[var(--muted)]">{rule.rule_code}</td>
                  <td className="p-4 text-muted-size text-[var(--muted)]">{rule.legal_reference}</td>
                  <td className="p-4 text-muted-size text-[var(--status-amber)] font-medium">
                    {rule.penalty_formula}
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-muted-size font-medium text-[var(--brand)] inline-flex items-center gap-1">
                      Rule
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
