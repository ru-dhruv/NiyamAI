"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FilePlus2, FileCheck2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getLicences } from "@/mocks/loader";
import { useAuth } from "@/lib/auth";
import type { Licence } from "@/mocks/types";

export default function LicencesPage() {
  const t = useTranslations("licences");
  const { openSheet } = useDetailSheet();
  const { isCA } = useAuth();

  const [licences, setLicences] = React.useState<Licence[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchLicences = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getLicences();
      setLicences(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLicences();
  }, [fetchLicences]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
        <Skeleton className="h-64 rounded-[22px]" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load your licences." onRetry={fetchLicences} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header with single primary button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--ny-muted)] mt-1">{t("subtitle")}</p>
        </div>
        {!isCA && (
          <Button
            variant="primary"
            className="gap-2 self-start sm:self-auto font-bold rounded-full"
            onClick={() => openSheet("add-licence")}
          >
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            <span>{t("addLicenceButton")}</span>
          </Button>
        )}
      </div>

      {licences.length === 0 ? (
        <EmptyState
          message={t("emptyMessage")}
          actionLabel={!isCA ? t("addFirstLicence") : undefined}
          onAction={!isCA ? () => openSheet("add-licence") : undefined}
          icon={FileCheck2}
        />
      ) : (
        <Card className="p-0 overflow-hidden rounded-[22px]">
          {/* Desktop Table View (sm+) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-muted)] font-bold uppercase tracking-wider">
                  <th scope="col" className="p-4 pl-6">{t("tableHeadLicence")}</th>
                  <th scope="col" className="p-4">{t("tableHeadNumber")}</th>
                  <th scope="col" className="p-4">{t("tableHeadExpiry")}</th>
                  <th scope="col" className="p-4">{t("tableHeadStatus")}</th>
                  <th scope="col" className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ny-border)] text-xs">
                {licences.map((lic) => (
                  <tr
                    key={lic.id}
                    onClick={() => openSheet("licence", lic.id)}
                    className="hover:bg-[var(--ny-bg)] cursor-pointer transition-colors"
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSheet("licence", lic.id);
                      }
                    }}
                    aria-label={`View ${lic.type} licence details`}
                  >
                    <td className="p-4 pl-6 font-bold text-sm text-[var(--ny-text)]">{lic.type}</td>
                    <td className="p-4 font-mono text-xs text-[var(--ny-muted)]">{lic.number}</td>
                    <td className="p-4 text-[var(--ny-text)]">
                      <div className="font-semibold">{lic.expiry}</div>
                      <span className="text-[11px] text-[var(--ny-muted)]">
                        {lic.daysRemaining < 0
                          ? `Expired ${Math.abs(lic.daysRemaining)}d ago`
                          : `${lic.daysRemaining}d remaining`}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusChip status={lic.status} />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="text-xs font-semibold text-[var(--ny-forest)] inline-flex items-center gap-1">
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< sm) */}
          <div className="sm:hidden divide-y divide-[var(--ny-border)]">
            {licences.map((lic) => (
              <div
                key={lic.id}
                onClick={() => openSheet("licence", lic.id)}
                className="p-4 space-y-2.5 cursor-pointer hover:bg-[var(--ny-bg)] transition-colors active:bg-[var(--ny-bg)]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSheet("licence", lic.id);
                  }
                }}
                aria-label={`View ${lic.type} details`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--ny-text)]">{lic.type}</h3>
                    <p className="text-xs font-mono text-[var(--ny-muted)] mt-0.5">{lic.number}</p>
                  </div>
                  <StatusChip status={lic.status} />
                </div>
                <div className="flex justify-between items-center text-xs pt-1 text-[var(--ny-muted)]">
                  <span>Expiry: {lic.expiry}</span>
                  <span className="text-[var(--ny-forest)] font-semibold flex items-center gap-1">
                    Details
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
