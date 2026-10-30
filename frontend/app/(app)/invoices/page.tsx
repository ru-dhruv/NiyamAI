"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { UploadCloud, FileText, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getInvoices } from "@/mocks/loader";
import { auditInvoice, saveInvoice } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Invoice } from "@/mocks/types";

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const { openSheet } = useDetailSheet();
  const { isCA } = useAuth();

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [auditing, setAuditing] = React.useState(false);

  const fetchInvoices = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAuditSample = async (sampleType: "bad-gstin" | "tax-mismatch" | "clean") => {
    setAuditing(true);
    try {
      const result = await auditInvoice(sampleType, "biz_001");
      const saved = await saveInvoice({
        business_id: "biz_001",
        extracted: result.extracted,
        issues: result.issues,
        risk: result.risk,
      });
      await fetchInvoices();
      openSheet("invoice", saved.id);
    } catch {
      alert("Error auditing invoice.");
    } finally {
      setAuditing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-[22px]" />
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load your invoices." onRetry={fetchInvoices} />;
  }

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
          Sample Data · Mod-36 Checksum Active
        </span>
      </div>

      {/* Upload Box & 3 Demo Samples (Hidden for CA) */}
      {!isCA && (
        <Card className="p-7 rounded-[22px] border border-dashed border-[var(--ny-border)] bg-[var(--ny-bg)]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-[#e5f3ee] text-[var(--ny-forest)] dark:bg-[#0d5b44]/30 flex items-center justify-center shrink-0">
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--ny-text)]">
                  {t("uploadTitle")}
                </h3>
                <p className="text-xs text-[var(--ny-muted)] mt-0.5">
                  Gemini OCR reads fields; mathematical rule tables audit GSTIN checksum &amp; rates.
                </p>
              </div>
            </div>

            {/* 3 Samples or Scanning State */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto">
              {auditing ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-xs font-bold text-[var(--ny-forest)]">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Auditing invoice rules...</span>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAuditSample("bad-gstin")}
                    className="rounded-full text-xs font-bold text-[var(--ny-status-red)] hover:bg-[var(--ny-status-red-bg)] border-[var(--ny-status-red-border)]"
                  >
                    + Bad GSTIN Sample
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAuditSample("tax-mismatch")}
                    className="rounded-full text-xs font-bold text-[var(--ny-status-amber)] hover:bg-[var(--ny-status-amber-bg)] border-[var(--ny-status-amber-border)]"
                  >
                    + Tax Mismatch Sample
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAuditSample("clean")}
                    className="rounded-full text-xs font-bold"
                  >
                    + Clean Invoice Sample
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Invoice Table or Empty */}
      {invoices.length === 0 ? (
        <EmptyState
          message={t("emptyMessage")}
          actionLabel={!isCA ? t("auditFirstInvoice") : undefined}
          onAction={!isCA ? () => handleAuditSample("clean") : undefined}
          icon={FileText}
        />
      ) : (
        <Card className="p-0 overflow-hidden rounded-[22px]">
          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-muted)] font-bold uppercase tracking-wider">
                  <th scope="col" className="p-4 pl-6">{t("tableHeadInvoice")}</th>
                  <th scope="col" className="p-4">{t("tableHeadParty")}</th>
                  <th scope="col" className="p-4">{t("tableHeadAmount")}</th>
                  <th scope="col" className="p-4">{t("tableHeadRisk")}</th>
                  <th scope="col" className="p-4">{t("tableHeadIssue")}</th>
                  <th scope="col" className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ny-border)] text-xs">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => openSheet("invoice", inv.id)}
                    className="hover:bg-[var(--ny-bg)] cursor-pointer transition-colors"
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSheet("invoice", inv.id);
                      }
                    }}
                    aria-label={`View audit for invoice ${inv.extracted.invoice_number}`}
                  >
                    <td className="p-4 pl-6 font-bold text-sm text-[var(--ny-text)]">
                      <div>{inv.extracted.invoice_number}</div>
                      <span className="text-[11px] font-normal text-[var(--ny-muted)]">
                        {inv.extracted.date}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-[var(--ny-muted)]">
                      {inv.extracted.seller_gstin}
                    </td>
                    <td className="p-4 font-semibold text-[var(--ny-text)]">
                      ₹{inv.extracted.total.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <StatusChip status={inv.risk} />
                        {inv.status === "fixed" && <StatusChip status="fixed" />}
                        {inv.status === "flagged" && <StatusChip status="flagged" />}
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      {inv.issues.length > 0 ? (
                        <span className="text-[var(--ny-status-red)] font-medium">
                          {inv.issues[0].message}
                        </span>
                      ) : (
                        <span className="text-[var(--ny-status-green)] inline-flex items-center gap-1 font-semibold">
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          Passed all checks
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="text-xs font-semibold text-[var(--ny-forest)] inline-flex items-center gap-1">
                        Audit Details
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< sm) */}
          <div className="sm:hidden divide-y divide-[var(--ny-border)]">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => openSheet("invoice", inv.id)}
                className="p-4 space-y-2 cursor-pointer hover:bg-[var(--ny-bg)] transition-colors active:bg-[var(--ny-bg)]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSheet("invoice", inv.id);
                  }
                }}
                aria-label={`View invoice ${inv.extracted.invoice_number}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--ny-text)]">
                      {inv.extracted.invoice_number}
                    </h3>
                    <p className="text-xs font-mono text-[var(--ny-muted)] mt-0.5">
                      {inv.extracted.seller_gstin}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusChip status={inv.risk} />
                    {inv.status === "fixed" && <StatusChip status="fixed" />}
                  </div>
                </div>
                <div className="text-xs">
                  {inv.issues.length > 0 ? (
                    <span className="text-[var(--ny-status-red)] font-medium block">
                      {inv.issues[0].message}
                    </span>
                  ) : (
                    <span className="text-[var(--ny-status-green)] font-semibold block">
                      Rule checks passed
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs pt-1 text-[var(--ny-muted)]">
                  <span className="font-bold text-[var(--ny-text)]">
                    ₹{inv.extracted.total.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[var(--ny-forest)] font-semibold flex items-center gap-1">
                    Audit details
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
