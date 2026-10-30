"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Download, MapPin, Phone, Clock, FileCheck2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
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
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
        <p className="text-muted-size text-[var(--muted)] mt-1">{t("subtitle")}</p>
      </div>

      {/* Action Banner: Exactly ONE primary button per screen */}
      <Card className="p-6 bg-[var(--panel)] border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-body font-semibold text-[var(--text)]">
              Pre-filled Statutory Renewal Application
            </h3>
            <p className="text-muted-size text-[var(--muted)] mt-0.5">
              Includes business PAN, GSTIN, holder details, and premises address pre-filled for FSSAI / Trade registration
            </p>
          </div>
          {/* Single primary button */}
          <Button
            variant="primary"
            size="lg"
            className="gap-2 w-full sm:w-auto"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{downloadSuccess ? "Form Downloaded (PDF)" : t("downloadPdf")}</span>
          </Button>
        </div>
      </Card>

      {/* Due Licences List */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-[var(--background)] border-b border-[var(--border)]">
          <h2 className="text-body font-semibold text-[var(--text)]">Licences Requiring Renewal Action</h2>
          <p className="text-muted-size text-[var(--muted)]">Status dynamically determined by expiry date</p>
        </div>

        {licencesDue.length === 0 ? (
          <div className="p-6">
            <EmptyState message={t("emptyRenewals")} icon={FileCheck2} />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {licencesDue.map((lic) => (
              <div
                key={lic.id}
                onClick={() => openSheet("licence", lic.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--background)] cursor-pointer transition-colors"
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-body font-semibold text-[var(--text)]">{lic.type}</h3>
                    <StatusChip status={lic.status} />
                  </div>
                  <p className="text-muted-size font-mono text-[var(--muted)] mt-0.5">
                    Registration No: {lic.number}
                  </p>
                  <p className="text-muted-size text-[var(--muted)]">
                    Expiry Date: {lic.expiry} ({lic.daysRemaining < 0 ? `${Math.abs(lic.daysRemaining)}d overdue` : `${lic.daysRemaining}d left`})
                  </p>
                </div>

                <Button variant="secondary" size="sm" onClick={() => openSheet("licence", lic.id)}>
                  View Document &amp; Form
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Nearby Regulatory & Renewal Offices */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-[var(--background)] border-b border-[var(--border)]">
          <h2 className="text-body font-semibold text-[var(--text)]">{t("officesTitle")}</h2>
          <p className="text-muted-size text-[var(--muted)]">
            In-person document verification and facilitation centres for registered entity
          </p>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {offices.map((office, idx) => (
            <div key={idx} className="p-4 space-y-2">
              <h3 className="text-body font-semibold text-[var(--text)]">{office.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-muted-size text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[var(--brand)] shrink-0" aria-hidden="true" />
                  <span>{office.address}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-[var(--muted)] shrink-0" aria-hidden="true" />
                  <span>{office.contact}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[var(--muted)] shrink-0" aria-hidden="true" />
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
