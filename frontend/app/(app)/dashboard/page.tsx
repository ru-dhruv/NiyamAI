"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  FilePlus2,
  FileCheck2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { StatusChip } from "@/components/ui/status-chip";
import { CountUp } from "@/components/ui/count-up";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getBusiness, getCalendarItems, getLicences } from "@/mocks/loader";
import { useAuth } from "@/lib/auth";
import type { Business, CalendarItem, Licence } from "@/mocks/types";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { openSheet } = useDetailSheet();
  const { isCA, user, ready } = useAuth();

  const [business, setBusiness] = React.useState<Business | null>(null);
  const [calendarItems, setCalendarItems] = React.useState<CalendarItem[]>([]);
  const [licences, setLicences] = React.useState<Licence[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [barsAnimated, setBarsAnimated] = React.useState(false);

  const loadDashboardData = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [bizData, calData, licData] = await Promise.all([
        getBusiness(),
        getCalendarItems(),
        getLicences(),
      ]);
      setBusiness(bizData);
      setCalendarItems(calData);
      setLicences(licData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  React.useEffect(() => {
    if (!loading && business) {
      const timer = setTimeout(() => setBarsAnimated(true), 150);
      return () => clearTimeout(timer);
    }
  }, [loading, business]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-[22px]" />
          <Skeleton className="h-64 rounded-[22px]" />
          <Skeleton className="h-64 rounded-[22px]" />
        </div>
        <Skeleton className="h-28 rounded-[22px]" />
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <ErrorState
        message="Unable to load dashboard compliance metrics."
        onRetry={loadDashboardData}
      />
    );
  }

  // Items due within 30 days or overdue
  const dueIn30Days = calendarItems.filter((i) => i.daysLeft <= 30);

  // Dynamic values from scoreBreakdown
  const licenceBreakdown = business.scoreBreakdown.find((b) => b.category === "Licences");
  const invoiceBreakdown = business.scoreBreakdown.find((b) => b.category === "Invoices");
  const flagBreakdown = business.scoreBreakdown.find((b) => b.category === "CA Flags");
  const filingBreakdown = business.scoreBreakdown.find((b) => b.category === "Filing Deadlines");

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--ny-muted)] mt-1">
            Real-time compliance ledger for {business.name} (Bhopal pilot)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-[var(--ny-muted)] shadow-sm">
            Sample Data · Last verified: Today
          </span>
        </div>
      </div>

      {/* Row 1: Three KPI Tiles — One tile filled dark green */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tile 1: Health Score — Filled Dark Green per Reference Spec */}
        <div className="rounded-[22px] bg-[var(--ny-forest-deep)] text-white p-7 shadow-[var(--ny-shadow-2)] flex flex-col justify-between ny-lift">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {t("healthScoreTitle")}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-[#86e2c3]">
                Sample Score
              </span>
            </div>
            <div className="flex items-center justify-between my-2">
              <div>
                <div className="text-5xl font-extrabold font-heading text-white">
                  <CountUp end={business.healthScore} duration={1200} />
                  <span className="text-xl font-medium text-white/60 ml-1">/100</span>
                </div>
                <p className="text-xs text-[#86e2c3] font-semibold mt-1">
                  {business.healthScore < 80 ? "Needs Attention (Active lapses)" : "Good Standing"}
                </p>
              </div>
              <div className="bg-white/10 p-2 rounded-full">
                <ScoreRing
                  score={business.healthScore}
                  size={72}
                  strokeWidth={7}
                  showSubtext={false}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 text-xs text-white/60 border-t border-white/10 mt-2">
            Verified across 3 licences &amp; 4 recent GST invoices
          </div>
        </div>

        {/* Tile 2: Indicative Penalty Exposure */}
        <Card className="flex flex-col justify-between ny-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("penaltyExposureTitle")}</CardTitle>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--ny-status-amber-bg)] text-[var(--ny-status-amber)] font-bold border border-[var(--ny-status-amber-border)]">
                Indicative
              </span>
            </div>
            <CardDescription>{t("penaltyExposureSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-1">
            <div className="text-4xl font-extrabold font-heading text-[var(--ny-status-red)]">
              <CountUp end={business.penaltyExposure} prefix="₹" duration={1200} />
            </div>
            <p className="text-xs text-[var(--ny-muted)] leading-relaxed">
              {t("penaltyExposureNotice")}
            </p>
          </CardContent>
          <div className="pt-3 border-t border-[var(--ny-border)]">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between rounded-full font-bold"
              onClick={() => openSheet("penalty-rule", "FSSAI_EXPIRING")}
            >
              <span>View Rule Calculations</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>

        {/* Tile 3: Due in 30 Days */}
        <Card className="flex flex-col justify-between ny-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("dueIn30DaysTitle")}</CardTitle>
              <Clock className="h-5 w-5 text-[var(--ny-muted)]" aria-hidden="true" />
            </div>
            <CardDescription>Licences and statutory return deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 py-1 flex-1">
            {dueIn30Days.length === 0 ? (
              <EmptyState message={t("dueIn30DaysEmpty")} />
            ) : (
              <ul className="divide-y divide-[var(--ny-border)]" role="list">
                {dueIn30Days.map((item) => (
                  <li
                    key={item.id}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[var(--ny-bg)] px-2 rounded-xl transition-colors"
                    onClick={() => openSheet("calendar-item", item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSheet("calendar-item", item.id);
                      }
                    }}
                    aria-label={`View deadline: ${item.title}`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-[var(--ny-text)] truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[var(--ny-muted)]">
                        Due: {item.dueDate}
                      </p>
                    </div>
                    <StatusChip
                      status={item.status === "overdue" ? "expired" : "expiring"}
                      label={item.daysLeft < 0 ? "Overdue" : `${item.daysLeft}d left`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <div className="pt-2 border-t border-[var(--ny-border)] text-xs text-[var(--ny-muted)]">
            Items sync with your statutory filing calendar
          </div>
        </Card>
      </div>

      {/* Row 2: Action Card with Pill Buttons — CA CANNOT SEE "Add licence" or "Check invoice" */}
      {!ready || !isCA ? (
        <Card className="p-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="font-heading font-bold text-2xl text-[var(--ny-text)]">
                {t("quickActionsTitle")}
              </h3>
              <p className="text-sm text-[var(--ny-muted)] mt-1 leading-relaxed">
                Upload compliance documents for automated scanning and rule auditing
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Exactly ONE Primary button per screen */}
              <Button
                variant="primary"
                size="lg"
                className="gap-2 w-full sm:w-auto font-bold rounded-full"
                onClick={() => openSheet("add-licence")}
              >
                <FilePlus2 className="h-5 w-5" aria-hidden="true" />
                <span>{t("addLicenceAction")}</span>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 w-full sm:w-auto font-bold rounded-full"
                onClick={() => openSheet("invoice", "inv_001")}
              >
                <FileCheck2 className="h-5 w-5 text-[var(--ny-muted)]" aria-hidden="true" />
                <span>{t("checkInvoiceAction")}</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-[#e5f3ee] dark:bg-[#0d5b44]/20 border border-[var(--ny-forest)]/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--ny-forest)] text-white flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--ny-text)]">
                  CA Advisor View
                </h3>
                <p className="text-xs text-[var(--ny-muted)]">
                  You are logged in as Chartered Accountant. Document uploading is restricted to the Business Owner.
                </p>
              </div>
            </div>
            <a href="/ca">
              <Button variant="primary" size="sm" className="rounded-full font-bold text-xs gap-1">
                <span>Open CA Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </Card>
      )}

      {/* Row 3: Score Breakdown with SVG Bar Chart & Lapses List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Bar Chart Card (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[var(--ny-forest)]" />
                  <span>Component Score Breakdown</span>
                </CardTitle>
                <CardDescription>
                  Points allocated across the 4 core pillars
                </CardDescription>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--ny-bg)] border border-[var(--ny-border)] text-[var(--ny-muted)]">
                Max 100 pts
              </span>
            </div>
          </CardHeader>

          <CardContent className="py-4">
            <svg
              viewBox="0 0 340 140"
              className="w-full h-40 overflow-visible"
              role="img"
              aria-label="Component score breakdown bar chart"
            >
              {/* Background horizontal guide lines */}
              <line x1="0" y1="100" x2="340" y2="100" stroke="var(--ny-border)" strokeWidth="1" />
              <line x1="0" y1="50" x2="340" y2="50" stroke="var(--ny-border)" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
              <line x1="0" y1="0" x2="340" y2="0" stroke="var(--ny-border)" strokeDasharray="3 3" strokeWidth="1" opacity="0.3" />

              {/* Bar 1: Licences — Weakest Component! Highlighted in Orange */}
              <g
                className="cursor-pointer"
                onClick={() => openSheet("licence", "lic_001")}
                tabIndex={0}
                role="button"
                aria-label={`Licences: ${licenceBreakdown?.score || 20} of ${licenceBreakdown?.max || 40} points`}
              >
                <rect
                  x="20"
                  y={100 - ((licenceBreakdown?.score || 20) / (licenceBreakdown?.max || 40)) * 100}
                  width="50"
                  height={((licenceBreakdown?.score || 20) / (licenceBreakdown?.max || 40)) * 100}
                  rx="6"
                  fill="var(--ny-accent)"
                  style={{
                    transformOrigin: "45px 100px",
                    transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s",
                  }}
                />
                <text x="45" y={100 - ((licenceBreakdown?.score || 20) / (licenceBreakdown?.max || 40)) * 100 - 8} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--ny-accent)">
                  {licenceBreakdown?.score || 20}/{licenceBreakdown?.max || 40}
                </text>
                <text x="45" y="118" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ny-text)">
                  Licences
                </text>
                <text x="45" y="130" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                  -{licenceBreakdown?.lost || 20} pts
                </text>
              </g>

              {/* Bar 2: Invoices */}
              <g
                className="cursor-pointer"
                onClick={() => openSheet("invoice", "inv_001")}
                tabIndex={0}
                role="button"
                aria-label={`Invoices: ${invoiceBreakdown?.score || 20} of ${invoiceBreakdown?.max || 30} points`}
              >
                <rect
                  x="105"
                  y={100 - ((invoiceBreakdown?.score || 20) / (invoiceBreakdown?.max || 30)) * 100}
                  width="50"
                  height={((invoiceBreakdown?.score || 20) / (invoiceBreakdown?.max || 30)) * 100}
                  rx="6"
                  fill="var(--ny-forest)"
                  style={{
                    transformOrigin: "130px 100px",
                    transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
                  }}
                />
                <text x="130" y={100 - ((invoiceBreakdown?.score || 20) / (invoiceBreakdown?.max || 30)) * 100 - 8} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--ny-forest)">
                  {invoiceBreakdown?.score || 20}/{invoiceBreakdown?.max || 30}
                </text>
                <text x="130" y="118" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ny-text)">
                  Invoices
                </text>
                <text x="130" y="130" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                  -{invoiceBreakdown?.lost || 10} pts
                </text>
              </g>

              {/* Bar 3: CA Flags */}
              <g
                className="cursor-pointer"
                onClick={() => openSheet("flag", "flag_001")}
                tabIndex={0}
                role="button"
                aria-label={`CA Flags: ${flagBreakdown?.score || 7} of ${flagBreakdown?.max || 15} points`}
              >
                <rect
                  x="190"
                  y={100 - ((flagBreakdown?.score || 7) / (flagBreakdown?.max || 15)) * 100}
                  width="50"
                  height={((flagBreakdown?.score || 7) / (flagBreakdown?.max || 15)) * 100}
                  rx="6"
                  fill="var(--ny-forest)"
                  style={{
                    transformOrigin: "215px 100px",
                    transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",
                  }}
                />
                <text x="215" y={100 - ((flagBreakdown?.score || 7) / (flagBreakdown?.max || 15)) * 100 - 8} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--ny-forest)">
                  {flagBreakdown?.score || 7}/{flagBreakdown?.max || 15}
                </text>
                <text x="215" y="118" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ny-text)">
                  CA Flags
                </text>
                <text x="215" y="130" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                  -{flagBreakdown?.lost || 8} pts
                </text>
              </g>

              {/* Bar 4: Filings */}
              <g
                className="cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={`Filings: ${filingBreakdown?.score || 15} of ${filingBreakdown?.max || 15} points`}
              >
                <rect
                  x="275"
                  y={100 - ((filingBreakdown?.score || 15) / (filingBreakdown?.max || 15)) * 100}
                  width="50"
                  height={((filingBreakdown?.score || 15) / (filingBreakdown?.max || 15)) * 100}
                  rx="6"
                  fill="var(--ny-forest)"
                  style={{
                    transformOrigin: "300px 100px",
                    transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
                  }}
                />
                <text x="300" y="-6" textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--ny-forest)">
                  {filingBreakdown?.score || 15}/{filingBreakdown?.max || 15}
                </text>
                <text x="300" y="118" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--ny-text)">
                  Filings
                </text>
                <text x="300" y="130" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                  Full
                </text>
              </g>
            </svg>
          </CardContent>

          <div className="pt-3 border-t border-[var(--ny-border)] flex items-center justify-between text-xs text-[var(--ny-muted)]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--ny-accent)]" />
              Weakest: Licences (-{licenceBreakdown?.lost || 20} pts deduction)
            </span>
            <span>Click any bar to audit</span>
          </div>
        </Card>

        {/* Lapses & Score Impact List (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>{t("scoreImpactTitle")}</CardTitle>
            <CardDescription>{t("scoreImpactSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y divide-[var(--ny-border)]">
              {business.scoreBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--ny-bg)] px-3 rounded-xl transition-colors cursor-pointer"
                  onClick={() => {
                    if (item.category === "Licences") {
                      openSheet("licence", "lic_001");
                    } else if (item.category === "Invoices") {
                      openSheet("invoice", "inv_001");
                    } else if (item.category === "CA Flags") {
                      openSheet("flag", "flag_001");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (item.category === "Licences") openSheet("licence", "lic_001");
                      else if (item.category === "Invoices") openSheet("invoice", "inv_001");
                      else if (item.category === "CA Flags") openSheet("flag", "flag_001");
                    }
                  }}
                  aria-label={`Fix issue: ${item.category}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        item.lost > 0
                          ? "bg-[var(--ny-status-red-bg)] text-[var(--ny-status-red)] border border-[var(--ny-status-red-border)]"
                          : "bg-[var(--ny-status-green-bg)] text-[var(--ny-status-green)] border border-[var(--ny-status-green-border)]"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--ny-text)] truncate">{item.category}</p>
                      <p className="text-[11px] text-[var(--ny-muted)] truncate">
                        {item.reasons[0] || `Max points: ${item.max}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        item.lost > 0 ? "text-[var(--ny-status-red)]" : "text-[var(--ny-status-green)]"
                      }`}
                    >
                      {item.lost > 0 ? `-${item.lost} pts` : "0 pts"}
                    </span>
                    <span className="text-xs text-[var(--ny-forest)] font-semibold flex items-center gap-0.5">
                      {t("viewAction")}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="pt-3 border-t border-[var(--ny-border)] text-xs text-[var(--ny-muted)]">
            Resolving licence expiry adds up to +{licenceBreakdown?.lost || 20} points
          </div>
        </Card>
      </div>
    </div>
  );
}
