"use client";

import * as React from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Building,
  User,
  Shield,
  MessageSquare,
  Send,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  getLicenceById,
  getInvoiceById,
  getRuleByCode,
  getFlagById,
  getCalendarItems,
} from "@/mocks/loader";
import {
  scanLicence,
  saveLicence,
  deleteLicence,
  markInvoiceFixed,
  createFlag,
  addFlagComment,
  setFlagStatus,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type {
  Licence,
  Invoice,
  Rule,
  Flag,
  CalendarItem,
  LicenceScanResult,
  FlagStatus,
} from "@/mocks/types";

// ── 1. Licence Detail Body ──────────────────────────────────────────────────
export function LicenceDetailBody({ id }: { id?: string }) {
  const [licence, setLicence] = React.useState<Licence | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    type: "",
    number: "",
    expiry: "",
    holder_name: "",
    issue_date: "",
  });
  const [deleted, setDeleted] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getLicenceById(id);
      if (data) {
        setLicence(data);
        setFormData({
          type: data.type,
          number: data.number,
          expiry: data.expiry,
          holder_name: data.holder_name || "",
          issue_date: data.issue_date || "",
        });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this licence? This will recompute your Compliance Health Score."
    );
    if (!confirmed) return;

    try {
      await deleteLicence(id, "biz_001");
      setDeleted(true);
      setTimeout(() => {
        window.location.href = "/licences";
      }, 700);
    } catch {
      alert("Failed to delete licence.");
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !licence) return;
    try {
      await saveLicence({
        business_id: "biz_001",
        type: formData.type,
        number: formData.number,
        expiry: formData.expiry,
        holder_name: formData.holder_name,
        issue_date: formData.issue_date,
        confidence: licence.confidence,
      });
      setIsEditing(false);
      loadData();
    } catch {
      alert("Failed to update licence.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  if (deleted) {
    return (
      <div className="p-8 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-[var(--ny-forest)] mx-auto" />
        <h4 className="font-heading font-bold text-lg text-[var(--ny-text)]">Licence Deleted</h4>
        <p className="text-xs text-[var(--ny-muted)]">
          Score recomputed. Redirecting to licences list...
        </p>
      </div>
    );
  }

  if (error || !licence) {
    return <ErrorState message="Could not load licence details." onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header status */}
      <div className="flex items-center justify-between border-b border-[var(--ny-border)] pb-4">
        <div>
          <h3 className="font-heading font-bold text-xl text-[var(--ny-text)]">{licence.type}</h3>
          <p className="text-xs font-mono text-[var(--ny-muted)] mt-0.5">{licence.number}</p>
        </div>
        <StatusChip status={licence.status} />
      </div>

      {/* Extracted fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-heading font-bold text-sm text-[var(--ny-text)]">
            Licence Record Details
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs gap-1.5 text-[var(--ny-forest)] rounded-full"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-3 bg-[var(--ny-bg)] p-4 rounded-[20px] border border-[var(--ny-border)]">
            <div>
              <label className="text-xs font-semibold text-[var(--ny-muted)] block mb-1">
                Licence Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-surface)] text-xs text-[var(--ny-text)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--ny-muted)] block mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-surface)] text-xs font-mono text-[var(--ny-text)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--ny-muted)] block mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-surface)] text-xs text-[var(--ny-text)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--ny-muted)] block mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-surface)] text-xs text-[var(--ny-text)]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--ny-muted)] block mb-1">
                Holder Name
              </label>
              <input
                type="text"
                value={formData.holder_name}
                onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-surface)] text-xs text-[var(--ny-text)]"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              className="w-full mt-2 rounded-full font-bold"
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 bg-[var(--ny-bg)] p-4 rounded-[20px] border border-[var(--ny-border)] text-xs">
            <div>
              <span className="text-[var(--ny-muted)] block mb-0.5">Holder Name</span>
              <span className="font-semibold text-[var(--ny-text)]">{licence.holder_name || "—"}</span>
            </div>
            <div>
              <span className="text-[var(--ny-muted)] block mb-0.5">Issue Date</span>
              <span className="font-semibold text-[var(--ny-text)]">{licence.issue_date || "—"}</span>
            </div>
            <div>
              <span className="text-[var(--ny-muted)] block mb-0.5">Expiry Date</span>
              <span className="font-semibold text-[var(--ny-text)]">{licence.expiry}</span>
            </div>
            <div>
              <span className="text-[var(--ny-muted)] block mb-0.5">AI Confidence</span>
              <span className="font-bold text-[var(--ny-forest)]">
                {Math.round(licence.confidence * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Placeholder */}
      <div className="space-y-2">
        <h4 className="font-heading font-bold text-sm text-[var(--ny-text)]">
          Certificate Scan Preview
        </h4>
        <div className="h-40 rounded-[20px] border border-dashed border-[var(--ny-border)] bg-[var(--ny-bg)] flex flex-col items-center justify-center text-center p-4">
          <FileText className="h-8 w-8 text-[var(--ny-muted)] mb-2" aria-hidden="true" />
          <p className="text-xs text-[var(--ny-muted)]">Verified digital certificate on record</p>
          <span className="text-xs font-semibold text-[var(--ny-forest)] mt-1">
            {licence.type.replace(/\s+/g, "_")}_{licence.number.slice(-4)}.pdf
          </span>
        </div>
      </div>

      {/* Delete action */}
      <div className="pt-4 border-t border-[var(--ny-border)] flex items-center justify-between">
        <span className="text-xs text-[var(--ny-muted)]">Manage registration</span>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="gap-2 rounded-full font-bold text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Delete Licence</span>
        </Button>
      </div>
    </div>
  );
}

// ── 2. Add Licence Body (Flow with 5 Samples) ──────────────────────────────
export function AddLicenceDetailBody() {
  const [scanning, setScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<LicenceScanResult | null>(null);
  const [formFields, setFormFields] = React.useState({
    licence_type: "",
    licence_number: "",
    holder_name: "",
    issue_date: "",
    expiry_date: "",
  });
  const [saved, setSaved] = React.useState(false);

  const sampleFiles = [
    {
      id: "sample_fssai",
      name: "FSSAI Food Licence (Expiring in 20 days)",
      fileKey: "fssai-expiring.pdf",
    },
    {
      id: "sample_trade",
      name: "Trade Licence (Valid till 2027)",
      fileKey: "trade-valid.pdf",
    },
    {
      id: "sample_fire",
      name: "Fire Safety NOC (Expired 2026-03-31)",
      fileKey: "fire-expired.pdf",
    },
    {
      id: "sample_blurry",
      name: "Blurry Photo (Low Confidence 42%)",
      fileKey: "blurry-photo.jpg",
    },
    {
      id: "sample_non_licence",
      name: "Utility Receipt (Not a Licence)",
      fileKey: "non-licence-bill.pdf",
    },
  ];

  const handleScanSample = async (fileKey: string) => {
    setScanning(true);
    setScanResult(null);
    setSaved(false);

    try {
      const res = await scanLicence(fileKey, "biz_001");
      setScanResult(res);
      setFormFields({
        licence_type: res.licence_type || "",
        licence_number: res.licence_number || "",
        holder_name: res.holder_name || "",
        issue_date: res.issue_date || "",
        expiry_date: res.expiry_date || "",
      });
    } catch {
      alert("Error scanning licence.");
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScanSample(file.name);
    }
  };

  const handleSaveConfirmed = async () => {
    if (!scanResult) return;
    if (!formFields.expiry_date) {
      alert("Please provide an expiry date to compute compliance status.");
      return;
    }

    try {
      await saveLicence({
        business_id: "biz_001",
        type: formFields.licence_type || "FSSAI",
        number: formFields.licence_number || "PENDING",
        expiry: formFields.expiry_date,
        confidence: scanResult.confidence,
        holder_name: formFields.holder_name,
        issue_date: formFields.issue_date,
      });
      setSaved(true);
      setTimeout(() => {
        window.location.href = "/licences";
      }, 700);
    } catch {
      alert("Failed to save licence.");
    }
  };

  if (saved) {
    return (
      <div className="p-8 text-center space-y-3">
        <CheckCircle2 className="h-12 w-12 text-[var(--ny-forest)] mx-auto" />
        <h4 className="font-heading font-bold text-xl text-[var(--ny-text)]">Licence Saved!</h4>
        <p className="text-xs text-[var(--ny-muted)]">
          Added to your compliance ledger. Health Score recomputed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="border border-dashed border-[var(--ny-border)] rounded-[22px] p-6 text-center bg-[var(--ny-bg)]">
        <UploadCloud className="h-9 w-9 text-[var(--ny-forest)] mx-auto mb-2" aria-hidden="true" />
        <p className="font-heading font-bold text-sm text-[var(--ny-text)]">
          Upload Licence Photo or PDF
        </p>
        <p className="text-xs text-[var(--ny-muted)] mt-1 max-w-xs mx-auto">
          Gemini extracts licence type, registration number, holder, and expiry date.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ny-forest)] text-white text-xs font-bold hover:bg-[#12382e] shadow-sm">
              <FileCheck2 className="h-4 w-4" />
              Choose File from Device
            </span>
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* 5 Sample Files */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--ny-muted)] block">
          Or Test with 5 Demo Samples:
        </span>
        <div className="space-y-1.5">
          {sampleFiles.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={scanning}
              onClick={() => handleScanSample(s.fileKey)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-surface)] hover:bg-[var(--ny-bg)] hover:border-[var(--ny-forest)] text-xs font-medium text-[var(--ny-text)] flex items-center justify-between transition-colors"
            >
              <span className="truncate">{s.name}</span>
              <span className="text-[10px] font-bold text-[var(--ny-forest)] uppercase tracking-wider shrink-0 ml-2">
                Scan Sample →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scanning State */}
      {scanning && (
        <div className="p-8 rounded-[22px] border border-[var(--ny-border)] bg-[var(--ny-bg)] text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-[var(--ny-forest)] animate-spin mx-auto" />
          <h4 className="font-heading font-bold text-base text-[var(--ny-text)]">
            Scanning document with Gemini...
          </h4>
          <p className="text-xs text-[var(--ny-muted)]">
            Extracting text, dates, registration codes &amp; validating format.
          </p>
        </div>
      )}

      {/* Scan Result Form */}
      {scanResult && !scanning && (
        <div className="space-y-5 rounded-[22px] border border-[var(--ny-border)] bg-[var(--ny-surface)] p-5 shadow-sm">
          {/* Header with confidence chip */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--ny-border)]">
            <div>
              <h4 className="font-heading font-bold text-sm text-[var(--ny-text)]">
                Extracted Fields
              </h4>
              <p className="text-[11px] text-[var(--ny-muted)]">Review &amp; edit before confirming</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold bg-[#e5f3ee] text-[var(--ny-forest)] border-[var(--ny-forest)]/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{Math.round(scanResult.confidence * 100)}% Confidence</span>
            </div>
          </div>

          {/* Validation Warnings & Errors */}
          {!scanResult.is_licence && (
            <div className="p-3 rounded-xl bg-[var(--ny-status-red-bg)] border border-[var(--ny-status-red-border)] text-xs text-[var(--ny-status-red)] flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Document Invalid</span>
                <span>This does not look like a licence. Please upload an official certificate.</span>
              </div>
            </div>
          )}

          {scanResult.confidence < 0.7 && scanResult.is_licence && (
            <div className="p-3 rounded-xl bg-[var(--ny-status-amber-bg)] border border-[var(--ny-status-amber-border)] text-xs text-[var(--ny-status-amber)] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Low Confidence Scan</span>
                <span>
                  The image resolution was low. Please double-check the expiry date and registration
                  number.
                </span>
              </div>
            </div>
          )}

          {!formFields.expiry_date && scanResult.is_licence && (
            <div className="p-3 rounded-xl bg-[var(--ny-status-amber-bg)] border border-[var(--ny-status-amber-border)] text-xs text-[var(--ny-status-amber)] flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Missing Expiry Date</span>
                <span>Please manually enter the licence expiry date to compute status.</span>
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[var(--ny-muted)] block mb-1">
                Licence Type
              </label>
              <input
                type="text"
                value={formFields.licence_type}
                onChange={(e) => setFormFields({ ...formFields, licence_type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-text)]"
                placeholder="e.g. FSSAI, Trade Licence"
              />
            </div>

            <div>
              <label className="font-semibold text-[var(--ny-muted)] block mb-1">
                Registration / Certificate Number
              </label>
              <input
                type="text"
                value={formFields.licence_number}
                onChange={(e) => setFormFields({ ...formFields, licence_number: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs font-mono text-[var(--ny-text)]"
                placeholder="Registration number"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[var(--ny-muted)] block mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={formFields.issue_date}
                  onChange={(e) => setFormFields({ ...formFields, issue_date: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-text)]"
                />
              </div>
              <div>
                <label className="font-semibold text-[var(--ny-muted)] block mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={formFields.expiry_date}
                  onChange={(e) => setFormFields({ ...formFields, expiry_date: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-text)] font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[var(--ny-muted)] block mb-1">
                Holder Business Name
              </label>
              <input
                type="text"
                value={formFields.holder_name}
                onChange={(e) => setFormFields({ ...formFields, holder_name: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-text)]"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-full font-bold text-xs"
            onClick={handleSaveConfirmed}
          >
            Confirm &amp; Save Licence
          </Button>
        </div>
      )}
    </div>
  );
}

// ── 3. Invoice Detail Body ──────────────────────────────────────────────────
export function InvoiceDetailBody({ id }: { id?: string }) {
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [showFlagInput, setShowFlagInput] = React.useState(false);
  const [flagNote, setFlagNote] = React.useState("");
  const [flagSuccess, setFlagSuccess] = React.useState(false);
  const [fixSuccess, setFixSuccess] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getInvoiceById(id);
      if (data) setInvoice(data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFlagToCA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !flagNote.trim()) return;

    try {
      await createFlag({
        business_id: "biz_001",
        itemRef: `invoices/${id}`,
        note: flagNote.trim(),
      });
      setFlagSuccess(true);
      setShowFlagInput(false);
      setFlagNote("");
      loadData();
    } catch {
      alert("Failed to flag invoice to CA.");
    }
  };

  const handleMarkFixed = async () => {
    if (!id) return;
    try {
      await markInvoiceFixed(id, "biz_001");
      setFixSuccess(true);
      loadData();
    } catch {
      alert("Failed to mark invoice fixed.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !invoice) {
    return <ErrorState message="Could not load invoice audit." onRetry={loadData} />;
  }

  const { extracted, issues, risk, status } = invoice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--ny-border)] pb-4">
        <div>
          <h3 className="font-heading font-bold text-xl text-[var(--ny-text)]">
            {extracted.invoice_number}
          </h3>
          <p className="text-xs text-[var(--ny-muted)] mt-0.5">Dated: {extracted.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={risk} />
          {status === "fixed" && <StatusChip status="fixed" />}
          {status === "flagged" && <StatusChip status="flagged" />}
        </div>
      </div>

      {/* Notifications */}
      {flagSuccess && (
        <div className="p-3 rounded-xl bg-[var(--ny-status-green-bg)] text-[var(--ny-status-green)] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Flag submitted! Item added to CA Workspace for review.</span>
        </div>
      )}

      {fixSuccess && (
        <div className="p-3 rounded-xl bg-[var(--ny-status-green-bg)] text-[var(--ny-status-green)] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Invoice marked as fixed. Compliance score recomputed!</span>
        </div>
      )}

      {/* Audit Issues */}
      <div className="space-y-3">
        <h4 className="font-heading font-bold text-sm text-[var(--ny-text)]">
          Compliance Rule Checks
        </h4>
        {issues.length === 0 ? (
          <div className="p-4 rounded-[18px] border border-[var(--ny-status-green-border)] bg-[var(--ny-status-green-bg)] text-[var(--ny-status-green)] text-xs flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="font-medium">
              All checks passed. GSTIN format, tax calculation, and checksum are valid.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[18px] border border-[var(--ny-status-red-border)] bg-[var(--ny-status-red-bg)] text-xs text-[var(--ny-status-red)] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono uppercase">{issue.rule_code}</span>
                  <span className="font-bold px-2 py-0.5 rounded-full bg-[var(--ny-status-red)] text-white text-[10px]">
                    {issue.severity} Severity
                  </span>
                </div>
                <p className="font-medium leading-relaxed">{issue.message}</p>
                {issue.field && (
                  <p className="text-[10px] opacity-80">Field checked: {issue.field}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Details */}
      <div className="space-y-3">
        <h4 className="font-heading font-bold text-sm text-[var(--ny-text)]">
          Extracted Invoice Data
        </h4>
        <div className="bg-[var(--ny-bg)] p-4 rounded-[20px] border border-[var(--ny-border)] space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
            <span className="text-[var(--ny-muted)]">Seller GSTIN</span>
            <span className="font-mono font-bold text-[var(--ny-text)]">{extracted.seller_gstin}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
            <span className="text-[var(--ny-muted)]">Buyer GSTIN</span>
            <span className="font-mono font-medium text-[var(--ny-text)]">
              {extracted.buyer_gstin || "N/A (B2C)"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
            <span className="text-[var(--ny-muted)]">Taxable Value</span>
            <span className="font-semibold text-[var(--ny-text)]">
              ₹{extracted.taxable_value.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
            <span className="text-[var(--ny-muted)]">Tax Rate</span>
            <span className="font-semibold text-[var(--ny-text)]">
              {(extracted.tax_rate * 100).toFixed(0)}% (Fraction: {extracted.tax_rate})
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
            <span className="text-[var(--ny-muted)]">Tax Amount</span>
            <span className="font-semibold text-[var(--ny-text)]">
              ₹{extracted.tax_amount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between py-1 pt-2 font-bold text-sm">
            <span className="text-[var(--ny-text)]">Total (INR)</span>
            <span className="text-[var(--ny-text)] font-heading">
              ₹{extracted.total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Flag to CA & Mark as fixed */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFlagInput(!showFlagInput)}
            className="flex-1 rounded-full font-bold text-xs gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Flag to CA</span>
          </Button>

          {status !== "fixed" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarkFixed}
              className="flex-1 rounded-full font-bold text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark as Fixed</span>
            </Button>
          )}
        </div>

        {showFlagInput && (
          <form onSubmit={handleFlagToCA} className="p-3.5 rounded-2xl bg-[var(--ny-bg)] border border-[var(--ny-border)] space-y-2">
            <label className="text-xs font-semibold text-[var(--ny-muted)] block">
              Note for your Chartered Accountant:
            </label>
            <textarea
              rows={2}
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              placeholder="e.g. Rate on this invoice appears wrong, please review with vendor..."
              className="w-full p-2.5 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-surface)] text-xs text-[var(--ny-text)]"
              required
            />
            <Button variant="primary" size="sm" type="submit" className="w-full rounded-full font-bold text-xs">
              Submit Flag to CA Workspace
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── 4. Penalty Rule Detail Body ─────────────────────────────────────────────
export function PenaltyRuleDetailBody({ id }: { id?: string }) {
  const [rule, setRule] = React.useState<Rule | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getRuleByCode(id);
      if (data) setRule(data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !rule) {
    return <ErrorState message="Could not load rule details." onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono font-bold text-[var(--ny-forest)] uppercase">
            Rule Code: {rule.rule_code}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--ny-bg)] border border-[var(--ny-border)] text-[var(--ny-muted)]">
            Sample Data
          </span>
        </div>
        <h3 className="font-heading font-extrabold text-xl text-[var(--ny-text)]">{rule.title}</h3>
      </div>

      <div className="space-y-4 text-xs">
        <div className="p-3.5 bg-[var(--ny-bg)] border border-[var(--ny-border)] rounded-[18px]">
          <span className="text-[var(--ny-muted)] block font-semibold mb-1">Legal Reference</span>
          <span className="text-[var(--ny-text)] font-medium leading-relaxed block">
            {rule.legal_reference}
          </span>
        </div>

        <div className="p-3.5 bg-[var(--ny-status-amber-bg)] border border-[var(--ny-status-amber-border)] rounded-[18px]">
          <span className="text-[var(--ny-status-amber)] block font-bold mb-1">
            Penalty Formula (Indicative)
          </span>
          <p className="text-[var(--ny-status-amber)] font-medium leading-relaxed">
            {rule.penalty_formula}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-[var(--ny-bg)] border border-[var(--ny-border)] rounded-[18px]">
            <span className="text-[var(--ny-muted)] block font-semibold mb-1">Official Source</span>
            <span className="text-[var(--ny-forest)] font-medium truncate block">
              {rule.source_url || "Official Gazette / Portal"}
            </span>
          </div>
          <div className="p-3.5 bg-[var(--ny-bg)] border border-[var(--ny-border)] rounded-[18px]">
            <span className="text-[var(--ny-muted)] block font-semibold mb-1">Last Verified</span>
            <span className="text-[var(--ny-text)] font-medium block">
              {rule.last_verified || "2026-10-29"}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--ny-surface)] border border-[var(--ny-border)] text-[11px] text-[var(--ny-muted)] italic leading-relaxed">
          Guidance, not legal or tax advice. All calculations are indicative and verified against
          statutory tables as of the last-verified date.
        </div>
      </div>
    </div>
  );
}

// ── 5. Flag Detail Body (CA Collaboration) ──────────────────────────────────
export function FlagDetailBody({ id }: { id?: string }) {
  const { isCA, user } = useAuth();
  const [flag, setFlag] = React.useState<Flag | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");

  const loadData = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getFlagById(id);
      if (data) setFlag(data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    try {
      await addFlagComment(id, "biz_001", newComment.trim());
      setNewComment("");
      loadData();
    } catch {
      alert("Failed to add comment.");
    }
  };

  const handleUpdateStatus = async (status: FlagStatus) => {
    if (!id) return;
    try {
      await setFlagStatus(id, "biz_001", status);
      loadData();
    } catch {
      alert("Failed to update flag status.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !flag) {
    return <ErrorState message="Could not load CA flag details." onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--ny-border)] pb-4">
        <div>
          <span className="text-xs font-mono text-[var(--ny-muted)]">Reference: {flag.itemRef}</span>
          <h3 className="font-heading font-bold text-xl text-[var(--ny-text)] mt-0.5">
            Flag #{flag.id}
          </h3>
        </div>
        <StatusChip status={flag.status} />
      </div>

      {/* Query note */}
      <div className="p-4 bg-[var(--ny-bg)] rounded-[20px] border border-[var(--ny-border)]">
        <span className="text-xs font-bold text-[var(--ny-muted)] uppercase tracking-wider block mb-1">
          Owner Query Note
        </span>
        <p className="text-xs text-[var(--ny-text)] leading-relaxed">{flag.note}</p>
      </div>

      {/* CA Status Controls */}
      {isCA && (
        <div className="p-3.5 rounded-[18px] bg-[#e5f3ee] dark:bg-[#0d5b44]/20 border border-[var(--ny-forest)]/30 space-y-2">
          <span className="text-xs font-bold text-[var(--ny-forest)] block">
            CA Workflow Status Action:
          </span>
          <div className="flex gap-2">
            <Button
              variant={flag.status === "needs-info" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleUpdateStatus("needs-info")}
              className="rounded-full text-xs"
            >
              Needs Info
            </Button>
            <Button
              variant={flag.status === "resolved" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleUpdateStatus("resolved")}
              className="rounded-full text-xs"
            >
              Mark Resolved
            </Button>
            {flag.status !== "open" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus("open")}
                className="rounded-full text-xs text-[var(--ny-muted)]"
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Comments Thread */}
      <div className="space-y-3">
        <h4 className="font-heading font-bold text-sm text-[var(--ny-text)]">
          Collaboration Thread
        </h4>
        <div className="space-y-2.5">
          {flag.comments.map((comm) => (
            <div
              key={comm.id}
              className="p-3.5 rounded-[18px] border border-[var(--ny-border)] bg-[var(--ny-surface)] space-y-1 shadow-sm"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--ny-forest)]">{comm.author}</span>
                <span className="text-[10px] text-[var(--ny-muted)]">
                  {new Date(comm.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-[var(--ny-text)] leading-relaxed">{comm.text}</p>
            </div>
          ))}
        </div>

        {/* Add comment input */}
        <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isCA ? "Write CA recommendation..." : "Write reply note..."}
            className="flex-1 h-11 px-4 rounded-full border border-[var(--ny-border)] bg-[var(--ny-surface)] text-xs text-[var(--ny-text)] focus-visible:ring-2 focus-visible:ring-[var(--ny-forest)]"
          />
          <Button variant="primary" type="submit" size="icon" aria-label="Send reply">
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── 6. Calendar Item Detail Body ────────────────────────────────────────────
export function CalendarItemDetailBody({ id }: { id?: string }) {
  const [item, setItem] = React.useState<CalendarItem | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await getCalendarItems();
      const match = items.find((i) => i.id === id);
      setItem(match || null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2 rounded-xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!item) {
    return <ErrorState message="Calendar deadline item not found." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--ny-border)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[var(--ny-muted)] font-semibold">
            {item.category}
          </span>
          <h3 className="font-heading font-bold text-xl text-[var(--ny-text)] mt-0.5">
            {item.title}
          </h3>
        </div>
        <StatusChip
          status={item.status === "overdue" ? "expired" : item.status === "due-soon" ? "expiring" : "valid"}
          label={item.status === "overdue" ? "Overdue" : item.status === "due-soon" ? "Due Soon" : "Upcoming"}
        />
      </div>

      <div className="bg-[var(--ny-bg)] p-4 rounded-[20px] border border-[var(--ny-border)] space-y-2.5 text-xs">
        <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
          <span className="text-[var(--ny-muted)]">Due Date</span>
          <span className="font-bold text-[var(--ny-text)]">{item.dueDate}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
          <span className="text-[var(--ny-muted)]">Days Remaining</span>
          <span className="font-bold text-[var(--ny-text)]">
            {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)} days overdue` : `${item.daysLeft} days left`}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/60">
          <span className="text-[var(--ny-muted)]">Linked Reference</span>
          <span className="font-mono text-[var(--ny-forest)] font-medium">
            {item.linkedRef || "Standard Statutory Calendar"}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[var(--ny-muted)]">Automated Reminder</span>
          <span className="font-medium text-[var(--ny-text)]">Email (7, 30, and 60 days before)</span>
        </div>
      </div>
    </div>
  );
}
