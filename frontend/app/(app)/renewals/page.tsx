"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, MapPin, Phone, Clock, FileCheck2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getLicences, getRenewalOffices } from "@/mocks/loader";
import type { Licence, RenewalOffice } from "@/mocks/types";

export default function RenewalsPage() {
  const t = useTranslations("renewals");
  const { openSheet } = useDetailSheet();

  const [licences, setLicences] = React.useState<Licence[]>([]);
  const [offices, setOffices] = React.useState<RenewalOffice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const fetchRenewalsData = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [licData, offData] = await Promise.all([getLicences(), getRenewalOffices()]);
      setLicences(licData);
      setOffices(offData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRenewalsData();
  }, [fetchRenewalsData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-32 rounded-[22px]" />
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load renewal information." onRetry={fetchRenewalsData} />;
  }

  // Licences requiring action (expiring soon or expired)
  const licencesDue = licences.filter((l) => l.status === "expiring" || l.status === "expired");

  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--ny-muted)] mt-1">{t("subtitle")}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-[var(--ny-muted)] shadow-sm self-start sm:self-auto">
          Sample Bhopal Facilitation Centers
        </span>
      </div>

      {/* Action Banner: Exactly ONE primary button per screen */}
      <Card className="p-7 rounded-[22px] bg-[var(--ny-surface)] border border-[var(--ny-border)] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="font-heading font-bold text-lg text-[var(--ny-text)]">
              Pre-filled Statutory Renewal Application
            </h3>
            <p className="text-xs text-[var(--ny-muted)] mt-1 max-w-xl leading-relaxed">
              Includes business PAN, GSTIN, holder details, and premises address pre-filled for FSSAI &amp; Trade Licence renewal.
            </p>
          </div>
          {/* Single primary button */}
          <Button
            variant="primary"
            size="lg"
            className="gap-2 w-full sm:w-auto rounded-full font-bold text-xs"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{downloadSuccess ? "Form Downloaded (PDF)" : t("downloadPdf")}</span>
          </Button>
        </div>
      </Card>

      {/* Due Licences List */}
      <Card className="p-0 overflow-hidden rounded-[22px]">
        <div className="p-5 bg-[var(--ny-bg)] border-b border-[var(--ny-border)] flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-[var(--ny-text)]">
              Licences Requiring Renewal Action
            </h2>
            <p className="text-xs text-[var(--ny-muted)] mt-0.5">
              Status dynamically determined by statutory expiry date
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--ny-status-amber-bg)] text-[var(--ny-status-amber)] border border-[var(--ny-status-amber-border)]">
            {licencesDue.length} Items Due
          </span>
        </div>

        {licencesDue.length === 0 ? (
          <div className="p-6">
            <EmptyState message={t("emptyRenewals")} icon={FileCheck2} />
          </div>
        ) : (
          <div className="divide-y divide-[var(--ny-border)]">
            {licencesDue.map((lic) => (
              <div
                key={lic.id}
                onClick={() => openSheet("licence", lic.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--ny-bg)] cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSheet("licence", lic.id);
                  }
                }}
                aria-label={`Renew ${lic.type}`}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-heading font-bold text-base text-[var(--ny-text)]">
                      {lic.type}
                    </h3>
                    <StatusChip status={lic.status} />
                  </div>
                  <p className="text-xs font-mono text-[var(--ny-muted)] mt-1">
                    Registration No: {lic.number}
                  </p>
                  <p className="text-xs text-[var(--ny-muted)] mt-0.5">
                    Expiry Date: {lic.expiry} ({lic.daysRemaining < 0 ? `${Math.abs(lic.daysRemaining)}d overdue` : `${lic.daysRemaining}d remaining`})
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSheet("licence", lic.id);
                  }}
                >
                  View Details &amp; Form
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Nearby Regulatory & Renewal Offices */}
      <Card className="p-0 overflow-hidden rounded-[22px]">
        <div className="p-5 bg-[var(--ny-bg)] border-b border-[var(--ny-border)]">
          <h2 className="font-heading font-bold text-base text-[var(--ny-text)]">
            {t("officesTitle")}
          </h2>
          <p className="text-xs text-[var(--ny-muted)] mt-0.5">
            In-person document verification and facilitation centres for registered Bhopal retail entity
          </p>
        </div>

        <div className="divide-y divide-[var(--ny-border)]">
          {offices.map((office, idx) => (
            <div key={idx} className="p-5 space-y-2">
              <h3 className="font-heading font-bold text-sm text-[var(--ny-text)]">
                {office.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[var(--ny-muted)] pt-1">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--ny-forest)] shrink-0" aria-hidden="true" />
                  <span>{office.address}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[var(--ny-muted)] shrink-0" aria-hidden="true" />
                  <span>{office.contact}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--ny-muted)] shrink-0" aria-hidden="true" />
                  <span>{office.timing}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
