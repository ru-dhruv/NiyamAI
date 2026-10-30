"use client";

import * as React from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building,
  User,
  Shield,
  MessageSquare,
  Send,
  ExternalLink,
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
import type {
  Licence,
  Invoice,
  Rule,
  Flag,
  CalendarItem,
} from "@/mocks/types";

// ── 1. Licence Detail Body ──────────────────────────────────────────────────
export function LicenceDetailBody({ id }: { id?: string }) {
  const [licence, setLicence] = React.useState<Licence | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getLicenceById(id);
      if (data) setLicence(data);
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
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !licence) {
    return <ErrorState message="Could not load licence details." onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header status */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="text-title text-[var(--text)]">{licence.type}</h3>
          <p className="text-muted-size text-[var(--muted)] font-mono">{licence.number}</p>
        </div>
        <StatusChip status={licence.status} />
      </div>

      {/* Extracted fields */}
      <div className="space-y-3">
        <h4 className="text-body font-semibold text-[var(--text)]">Extracted Information</h4>
        <div className="grid grid-cols-2 gap-3 text-body bg-[var(--background)] p-3 rounded-card border border-[var(--border)]">
          <div>
            <span className="text-muted-size text-[var(--muted)] block">Holder Name</span>
            <span className="font-medium text-[var(--text)]">{licence.holder_name || "—"}</span>
          </div>
          <div>
            <span className="text-muted-size text-[var(--muted)] block">Issue Date</span>
            <span className="font-medium text-[var(--text)]">{licence.issue_date || "—"}</span>
          </div>
          <div>
            <span className="text-muted-size text-[var(--muted)] block">Expiry Date</span>
            <span className="font-medium text-[var(--text)]">{licence.expiry}</span>
          </div>
          <div>
            <span className="text-muted-size text-[var(--muted)] block">AI Confidence</span>
            <span className="font-medium text-[var(--brand)]">
              {Math.round(licence.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Document Preview Placeholder */}
      <div className="space-y-2">
        <h4 className="text-body font-semibold text-[var(--text)]">Document Scan Preview</h4>
        <div className="h-44 rounded-card border border-dashed border-[var(--border)] bg-[var(--background)] flex flex-col items-center justify-center text-center p-4">
          <FileText className="h-8 w-8 text-[var(--muted)] mb-2" aria-hidden="true" />
          <p className="text-muted-size text-[var(--muted)]">Verified digital scan on record</p>
          <span className="text-muted-size text-[var(--brand)] font-medium mt-1">
            {licence.type}_{licence.number.slice(-4)}.pdf
          </span>
        </div>
      </div>

      {/* History */}
      <div className="space-y-2 border-t border-[var(--border)] pt-4">
        <h4 className="text-body font-semibold text-[var(--text)]">Verification History</h4>
        <ul className="text-muted-size text-[var(--muted)] space-y-1">
          <li>• Scanned & verified via Gemini AI extraction</li>
          <li>• Validated against municipal rules checklist</li>
          <li>• Status dynamically calculated based on current date</li>
        </ul>
      </div>
    </div>
  );
}

// ── 2. Add Licence Body ─────────────────────────────────────────────────────
export function AddLicenceDetailBody() {
  const [fileSelected, setFileSelected] = React.useState(true);

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="border border-dashed border-[var(--border)] rounded-card p-6 text-center bg-[var(--background)]">
        <UploadCloud className="h-8 w-8 text-[var(--brand)] mx-auto mb-2" aria-hidden="true" />
        <p className="text-body font-semibold text-[var(--text)]">
          {fileSelected ? "FSSAI_Certificate_Scan.pdf uploaded" : "Upload Licence (PDF or Photo)"}
        </p>
        <p className="text-muted-size text-[var(--muted)] mt-1">
          {fileSelected
            ? "Gemini extracted 5 fields with 96% confidence"
            : "Files are scanned with Gemini structured extraction"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setFileSelected(!fileSelected)}
        >
          {fileSelected ? "Upload Different File" : "Choose File"}
        </Button>
      </div>

      {/* Scanned Form Fields */}
      <div className="space-y-4">
        <h4 className="text-body font-semibold text-[var(--text)]">
          Confirm Extracted Details
        </h4>

        <div className="space-y-1">
          <label className="text-muted-size text-[var(--muted)] font-medium block">
            Licence Type
          </label>
          <input
            type="text"
            defaultValue="FSSAI Food Business Operator"
            className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
          />
        </div>

        <div className="space-y-1">
          <label className="text-muted-size text-[var(--muted)] font-medium block">
            Licence Registration Number (14 digits)
          </label>
          <input
            type="text"
            defaultValue="10014011001234"
            className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-muted-size text-[var(--muted)] font-medium block">
              Issue Date
            </label>
            <input
              type="date"
              defaultValue="2021-11-19"
              className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
            />
          </div>
          <div className="space-y-1">
            <label className="text-muted-size text-[var(--muted)] font-medium block">
              Expiry Date
            </label>
            <input
              type="date"
              defaultValue="2026-11-18"
              className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-muted-size text-[var(--muted)] font-medium block">
            Holder Business Name
          </label>
          <input
            type="text"
            defaultValue="Sharma Kirana & Food Mart"
            className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
          />
        </div>
      </div>

      <div className="p-3 bg-[var(--brand-subtle)] border border-[var(--border)] rounded-card text-muted-size text-[var(--text)]">
        Review fields carefully before saving. Saving recomputes your Compliance Health Score.
      </div>
    </div>
  );
}

// ── 3. Invoice Detail Body ──────────────────────────────────────────────────
export function InvoiceDetailBody({ id }: { id?: string }) {
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return <ErrorState message="Could not load invoice audit." onRetry={loadData} />;
  }

  const { extracted, issues, risk } = invoice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="text-title text-[var(--text)]">{extracted.invoice_number}</h3>
          <p className="text-muted-size text-[var(--muted)]">Dated: {extracted.date}</p>
        </div>
        <StatusChip status={risk} />
      </div>

      {/* Audit Issues */}
      <div className="space-y-3">
        <h4 className="text-body font-semibold text-[var(--text)]">Compliance Rule Checks</h4>
        {issues.length === 0 ? (
          <div className="p-3 rounded-card border border-[var(--status-green-border)] bg-[var(--status-green-bg)] text-[var(--status-green)] text-body flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>All rule checks passed. GSTIN format, tax calculation and totals are valid.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 rounded-card border border-[var(--status-red-border)] bg-[var(--status-red-bg)] text-[var(--status-red)] text-body"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-size uppercase font-mono">
                    {issue.rule_code}
                  </span>
                  <span className="text-muted-size font-medium">Lapse</span>
                </div>
                <p className="text-body mt-1">{issue.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Details */}
      <div className="space-y-3">
        <h4 className="text-body font-semibold text-[var(--text)]">Extracted Invoice Data</h4>
        <div className="bg-[var(--background)] p-4 rounded-card border border-[var(--border)] space-y-3 text-body">
          <div className="flex justify-between py-1 border-b border-[var(--border)]">
            <span className="text-muted-size text-[var(--muted)]">Seller GSTIN</span>
            <span className="font-mono font-medium text-[var(--text)]">{extracted.seller_gstin}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--border)]">
            <span className="text-muted-size text-[var(--muted)]">Buyer GSTIN</span>
            <span className="font-mono font-medium text-[var(--text)]">{extracted.buyer_gstin || "N/A (B2C)"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--border)]">
            <span className="text-muted-size text-[var(--muted)]">Taxable Value</span>
            <span className="font-medium text-[var(--text)]">₹{extracted.taxable_value.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--border)]">
            <span className="text-muted-size text-[var(--muted)]">Tax Rate</span>
            <span className="font-medium text-[var(--text)]">{(extracted.tax_rate * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[var(--border)]">
            <span className="text-muted-size text-[var(--muted)]">Tax Amount</span>
            <span className="font-medium text-[var(--text)]">₹{extracted.tax_amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-1 pt-2 font-semibold">
            <span className="text-[var(--text)]">Total (INR)</span>
            <span className="text-[var(--text)]">₹{extracted.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
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
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !rule) {
    return <ErrorState message="Could not load rule details." onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-muted-size font-mono text-[var(--muted)] uppercase block">
          Rule Code: {rule.rule_code}
        </span>
        <h3 className="text-title text-[var(--text)] mt-1">{rule.title}</h3>
      </div>

      <div className="space-y-4 text-body">
        <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-card">
          <span className="text-muted-size text-[var(--muted)] block font-medium">Legal Reference</span>
          <span className="text-[var(--text)] font-medium mt-1 block">
            {rule.legal_reference}
          </span>
        </div>

        <div className="p-3 bg-[var(--status-amber-bg)] border border-[var(--status-amber-border)] rounded-card">
          <span className="text-muted-size text-[var(--status-amber)] block font-medium">
            Penalty Formula (Indicative)
          </span>
          <p className="text-[var(--status-amber)] font-medium mt-1">
            {rule.penalty_formula}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-card">
            <span className="text-muted-size text-[var(--muted)] block font-medium">Official Source</span>
            <span className="text-[var(--brand)] text-muted-size truncate block mt-1">
              {rule.source_url || "Official Gazette / Portal"}
            </span>
          </div>
          <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-card">
            <span className="text-muted-size text-[var(--muted)] block font-medium">Last Verified</span>
            <span className="text-[var(--text)] text-muted-size block mt-1">
              {rule.last_verified || "2026-10-29"}
            </span>
          </div>
        </div>

        <p className="text-muted-size text-[var(--muted)] italic pt-2">
          Note: This formula provides automated guidance based on the rule database. Official notices and fine assessments must be reviewed with your Chartered Accountant.
        </p>
      </div>
    </div>
  );
}

// ── 5. Flag Detail Body ─────────────────────────────────────────────────────
export function FlagDetailBody({ id }: { id?: string }) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (error || !flag) {
    return <ErrorState message="Could not load CA flag details." onRetry={loadData} />;
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const commentObj = {
      id: `comm_${Date.now()}`,
      author: "Ramesh Sharma (Owner)",
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setFlag({
      ...flag,
      comments: [...flag.comments, commentObj],
    });
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <span className="text-muted-size font-mono text-[var(--muted)]">Reference: {flag.itemRef}</span>
          <h3 className="text-title text-[var(--text)] mt-1">Flag #{flag.id}</h3>
        </div>
        <StatusChip status={flag.status} />
      </div>

      <div className="p-4 bg-[var(--background)] rounded-card border border-[var(--border)]">
        <span className="text-muted-size text-[var(--muted)] block font-medium">Owner&apos;s Query Note</span>
        <p className="text-body text-[var(--text)] mt-1">{flag.note}</p>
      </div>

      {/* Comments Thread */}
      <div className="space-y-3">
        <h4 className="text-body font-semibold text-[var(--text)]">CA Advice Thread</h4>
        <div className="space-y-3">
          {flag.comments.map((comm) => (
            <div
              key={comm.id}
              className="p-3 rounded-card border border-[var(--border)] bg-[var(--panel)] space-y-1"
            >
              <div className="flex justify-between items-center text-muted-size">
                <span className="font-semibold text-[var(--brand)]">{comm.author}</span>
                <span className="text-[var(--muted)]">
                  {new Date(comm.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-body text-[var(--text)]">{comm.text}</p>
            </div>
          ))}
        </div>

        {/* Add comment input */}
        <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write reply for CA..."
            className="flex-1 h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
          />
          <Button variant="secondary" type="submit" aria-label="Send reply">
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
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!item) {
    return <ErrorState message="Calendar deadline item not found." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <span className="text-muted-size uppercase text-[var(--muted)] font-mono">{item.category}</span>
          <h3 className="text-title text-[var(--text)] mt-1">{item.title}</h3>
        </div>
        <StatusChip status={item.status === "overdue" ? "expired" : item.status === "due-soon" ? "expiring" : "valid"} label={item.status === "overdue" ? "Overdue" : item.status === "due-soon" ? "Due Soon" : "Upcoming"} />
      </div>

      <div className="bg-[var(--background)] p-4 rounded-card border border-[var(--border)] space-y-3 text-body">
        <div className="flex justify-between py-1 border-b border-[var(--border)]">
          <span className="text-muted-size text-[var(--muted)]">Due Date</span>
          <span className="font-semibold text-[var(--text)]">{item.dueDate}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[var(--border)]">
          <span className="text-muted-size text-[var(--muted)]">Days Remaining</span>
          <span className="font-semibold text-[var(--text)]">
            {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)} days overdue` : `${item.daysLeft} days left`}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-[var(--border)]">
          <span className="text-muted-size text-[var(--muted)]">Linked Compliance Reference</span>
          <span className="font-mono text-[var(--brand)]">{item.linkedRef || "Standard Statutory Calendar"}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-muted-size text-[var(--muted)]">Automated Reminder</span>
          <span className="font-medium text-[var(--text)]">Email (7, 30, and 60 days before)</span>
        </div>
      </div>
    </div>
  );
}
