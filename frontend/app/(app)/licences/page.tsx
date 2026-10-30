"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FilePlus2, FileCheck2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useDetailSheet } from "@/components/shell/DetailSheet";
import { getLicences } from "@/mocks/loader";
import type { Licence } from "@/mocks/types";

export default function LicencesPage() {
  const t = useTranslations("licences");
  const { openSheet } = useDetailSheet();

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
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-11 w-36" />
        </div>
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Could not load your licences." onRetry={fetchLicences} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with single primary button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
          <p className="text-muted-size text-[var(--muted)] mt-1">{t("subtitle")}</p>
        </div>
        {/* Exactly one primary button per screen */}
        <Button
          variant="primary"
          className="gap-2 self-start sm:self-auto"
          onClick={() => openSheet("add-licence")}
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          <span>{t("addLicenceButton")}</span>
        </Button>
      </div>

      {licences.length === 0 ? (
        <EmptyState
          message={t("emptyMessage")}
          actionLabel={t("addFirstLicence")}
          onAction={() => openSheet("add-licence")}
          icon={FileCheck2}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          {/* Desktop Table View (sm+) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)] text-muted-size text-[var(--muted)] font-medium">
                  <th scope="col" className="p-4">{t("tableHeadLicence")}</th>
                  <th scope="col" className="p-4">{t("tableHeadNumber")}</th>
                  <th scope="col" className="p-4">{t("tableHeadExpiry")}</th>
                  <th scope="col" className="p-4">{t("tableHeadStatus")}</th>
                  <th scope="col" className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-body">
                {licences.map((lic) => (
                  <tr
                    key={lic.id}
                    onClick={() => openSheet("licence", lic.id)}
                    className="hover:bg-[var(--background)] cursor-pointer transition-colors"
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
                    <td className="p-4 font-semibold text-[var(--text)]">{lic.type}</td>
                    <td className="p-4 font-mono text-muted-size text-[var(--muted)]">{lic.number}</td>
                    <td className="p-4 text-[var(--text)]">
                      <div>{lic.expiry}</div>
                      <span className="text-muted-size text-[var(--muted)]">
                        {lic.daysRemaining < 0
                          ? `Expired ${Math.abs(lic.daysRemaining)}d ago`
                          : `${lic.daysRemaining}d remaining`}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusChip status={lic.status} />
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-muted-size font-medium text-[var(--brand)] inline-flex items-center gap-1">
                        View
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone Cards View (< sm) */}
          <div className="sm:hidden divide-y divide-[var(--border)]">
            {licences.map((lic) => (
              <div
                key={lic.id}
                onClick={() => openSheet("licence", lic.id)}
                className="p-4 space-y-2 cursor-pointer hover:bg-[var(--background)] transition-colors active:bg-[var(--background)]"
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
                    <h3 className="text-body font-semibold text-[var(--text)]">{lic.type}</h3>
                    <p className="text-muted-size font-mono text-[var(--muted)] mt-0.5">{lic.number}</p>
                  </div>
                  <StatusChip status={lic.status} />
                </div>
                <div className="flex justify-between items-center text-muted-size pt-1 text-[var(--muted)]">
                  <span>Expiry: {lic.expiry}</span>
                  <span className="text-[var(--brand)] font-medium flex items-center gap-1">
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
