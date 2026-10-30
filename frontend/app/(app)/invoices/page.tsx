"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { UploadCloud, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getInvoices } from "@/mocks/loader";
import type { Invoice } from "@/mocks/types";

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const { openSheet } = useDetailSheet();

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load your invoices." onRetry={fetchInvoices} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
        <p className="text-muted-size text-[var(--muted)] mt-1">{t("subtitle")}</p>
      </div>

      {/* Upload Box: Clean ledger, dashed border, single primary button */}
      <Card className="border-dashed border-[var(--border)] p-6 bg-[var(--background)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-btn bg-[var(--brand-subtle)] border border-[var(--border)] flex items-center justify-center shrink-0">
              <UploadCloud className="h-6 w-6 text-[var(--brand)]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-body font-semibold text-[var(--text)]">{t("uploadTitle")}</h3>
              <p className="text-muted-size text-[var(--muted)] mt-0.5">{t("uploadSubtitle")}</p>
            </div>
          </div>
          {/* Exactly one primary button per screen */}
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => openSheet("invoice", "inv_001")}
          >
            {t("uploadButton")}
          </Button>
        </div>
      </Card>

      {/* Invoice Table or Empty */}
      {invoices.length === 0 ? (
        <EmptyState
          message={t("emptyMessage")}
          actionLabel={t("auditFirstInvoice")}
          onAction={() => openSheet("invoice", "inv_001")}
          icon={FileText}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)] text-muted-size text-[var(--muted)] font-medium">
                  <th scope="col" className="p-4">{t("tableHeadInvoice")}</th>
                  <th scope="col" className="p-4">{t("tableHeadParty")}</th>
                  <th scope="col" className="p-4">{t("tableHeadAmount")}</th>
                  <th scope="col" className="p-4">{t("tableHeadRisk")}</th>
                  <th scope="col" className="p-4">{t("tableHeadIssue")}</th>
                  <th scope="col" className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-body">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => openSheet("invoice", inv.id)}
                    className="hover:bg-[var(--background)] cursor-pointer transition-colors"
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
                    <td className="p-4 font-semibold text-[var(--text)]">
                      <div>{inv.extracted.invoice_number}</div>
                      <span className="text-muted-size text-[var(--muted)]">{inv.extracted.date}</span>
                    </td>
                    <td className="p-4 font-mono text-muted-size text-[var(--muted)]">
                      {inv.extracted.seller_gstin}
                    </td>
                    <td className="p-4 font-medium text-[var(--text)]">
                      ₹{inv.extracted.total.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <StatusChip status={inv.risk} />
                    </td>
                    <td className="p-4 text-muted-size">
                      {inv.issues.length > 0 ? (
                        <span className="text-[var(--status-red)] font-medium">
                          {inv.issues[0].message}
                        </span>
                      ) : (
                        <span className="text-[var(--status-green)] inline-flex items-center gap-1 font-medium">
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          Passed all checks
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-muted-size font-medium text-[var(--brand)] inline-flex items-center gap-1">
                        Audit
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< sm) */}
          <div className="sm:hidden divide-y divide-[var(--border)]">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => openSheet("invoice", inv.id)}
                className="p-4 space-y-2 cursor-pointer hover:bg-[var(--background)] transition-colors active:bg-[var(--background)]"
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
                    <h3 className="text-body font-semibold text-[var(--text)]">
                      {inv.extracted.invoice_number}
                    </h3>
                    <p className="text-muted-size font-mono text-[var(--muted)]">
                      {inv.extracted.seller_gstin}
                    </p>
                  </div>
                  <StatusChip status={inv.risk} />
                </div>
                <div className="text-muted-size">
                  {inv.issues.length > 0 ? (
                    <span className="text-[var(--status-red)] font-medium block">
                      {inv.issues[0].message}
                    </span>
                  ) : (
                    <span className="text-[var(--status-green)] font-medium block">
                      Rule checks passed
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-muted-size pt-1 text-[var(--muted)]">
                  <span className="font-semibold text-[var(--text)]">
                    ₹{inv.extracted.total.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[var(--brand)] font-medium flex items-center gap-1">
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
