export type UserRole = "Owner" | "CA";

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  email?: string;
  language: string;
  businessIds: string[];
}

export interface ScoreBreakdownItem {
  category: string;
  score: number;
  max: number;
  lost: number;
  reasons: string[];
}

export interface Business {
  id: string;
  name: string;
  gstin: string;
  type: string;
  city: string;
  state: string;
  ownerUid: string;
  caUids: string[];
  healthScore: number;
  penaltyExposure: number;
  scoreUpdatedAt: string; // ISO 8601 string
  scoreBreakdown: ScoreBreakdownItem[];
  createdAt?: string;
}

export type LicenceStatus = "valid" | "expiring" | "expired";

/**
 * Scan result returned by POST /licences/scan
 */
export interface LicenceScanResult {
  licence_type: string;
  licence_number: string;
  holder_name: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  confidence: number;
  status?: LicenceStatus;
  is_licence: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Raw licence record stored in database (status is NEVER stored here).
 */
export interface LicenceRaw {
  id: string;
  type: string;
  number: string;
  expiry: string; // YYYY-MM-DD
  confidence: number;
  holder_name: string | null;
  issue_date: string | null;
  fileUrl?: string | null;
  createdAt?: string;
  createdBy?: string;
}

/**
 * Computed licence record returned by queries with dynamic status.
 */
export interface Licence extends LicenceRaw {
  status: LicenceStatus;
  daysRemaining: number;
}

/**
 * Input for saving a confirmed licence.
 */
export interface SaveLicenceInput {
  business_id: string;
  type: string;
  number: string;
  expiry: string;
  fileUrl?: string | null;
  confidence: number;
  holder_name?: string | null;
  issue_date?: string | null;
}

/**
 * Converts between scan result and saved licence in ONE function.
 */
export function scanResultToLicence(
  scan: LicenceScanResult,
  fileUrl?: string | null
): Omit<LicenceRaw, "id"> {
  return {
    type: scan.licence_type,
    number: scan.licence_number,
    expiry: scan.expiry_date || "",
    confidence: scan.confidence,
    holder_name: scan.holder_name,
    issue_date: scan.issue_date,
    fileUrl: fileUrl || null,
  };
}

export function licenceToScanResult(lic: LicenceRaw): LicenceScanResult {
  return {
    licence_type: lic.type,
    licence_number: lic.number,
    holder_name: lic.holder_name ?? null,
    issue_date: lic.issue_date ?? null,
    expiry_date: lic.expiry,
    confidence: lic.confidence,
    is_licence: true,
    warnings: [],
    errors: [],
  };
}

/**
 * Computes dynamic licence status and days remaining based on expiry date.
 * STATUS IS NEVER STORED IN DATABASE, ONLY COMPUTED DYNAMICALLY HERE.
 * - Expired: expiry date is in the past (< 0 days)
 * - Expiring: 30 days or fewer remaining (>= 0 and <= 30 days)
 * - Valid: more than 30 days remaining (> 30 days)
 */
export function computeLicenceStatus(expiryDateStr: string, refDate?: Date): {
  status: LicenceStatus;
  daysRemaining: number;
} {
  if (!expiryDateStr) {
    return { status: "expired", daysRemaining: -999 };
  }
  const now = refDate || new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const [year, month, day] = expiryDateStr.split("-").map(Number);
  if (!year || !month || !day) {
    return { status: "expired", daysRemaining: -999 };
  }
  const expiry = new Date(Date.UTC(year, month - 1, day));

  const diffMs = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: "expired", daysRemaining };
  }
  if (daysRemaining <= 30) {
    return { status: "expiring", daysRemaining };
  }
  return { status: "valid", daysRemaining };
}

export interface ExtractedInvoice {
  invoice_number: string;
  date: string;
  seller_gstin: string;
  buyer_gstin: string | null;
  taxable_value: number;
  tax_rate: number; // fraction e.g. 0.18
  tax_amount: number;
  total: number;
  currency: string;
}

export interface InvoiceIssue {
  rule_code: string;
  field: string;
  message: string;
  severity: "High" | "Medium" | "Low";
}

export type InvoiceRisk = "Low" | "Medium" | "High";
export type InvoiceStatus = "active" | "fixed" | "flagged";

export interface Invoice {
  id: string;
  extracted: ExtractedInvoice;
  issues: InvoiceIssue[];
  risk: InvoiceRisk;
  status: InvoiceStatus;
  fileUrl?: string | null;
  createdAt?: string;
  createdBy?: string;
}

export interface InvoiceAuditResult {
  extracted: ExtractedInvoice;
  issues: InvoiceIssue[];
  risk: InvoiceRisk;
}

export interface SaveInvoiceInput {
  business_id: string;
  extracted: ExtractedInvoice;
  issues: InvoiceIssue[];
  risk: InvoiceRisk;
  fileUrl?: string | null;
}

export type FlagStatus = "open" | "needs-info" | "resolved";

export interface FlagComment {
  id: string;
  author: string;
  authorUid?: string;
  authorRole?: UserRole;
  text: string;
  createdAt: string;
}

export interface Flag {
  id: string;
  itemRef: string; // e.g. "invoices/inv_123"
  note: string;
  status: FlagStatus;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  comments: FlagComment[];
}

export interface Rule {
  rule_code: string;
  title: string;
  legal_reference: string;
  penalty_formula: string;
  source_url: string;
  last_verified: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  dueDate: string;
  category: "licence" | "gst" | "filing";
  linkedRef?: string;
  status: "overdue" | "due-soon" | "upcoming";
  daysLeft: number;
}

export interface TaxSavingSuggestion {
  id: string;
  title: string;
  reason: string;
  estimatedRupees: number;
  category: string;
}

export interface RenewalOffice {
  name: string;
  address: string;
  city: string;
  contact: string;
  timing: string;
}

/**
 * Maps risk severity or risk level to tone in ONE function.
 */
export function mapRiskToTone(risk: InvoiceRisk | string): {
  tone: "green" | "amber" | "red";
  label: "Low" | "Medium" | "High";
} {
  const normalized = (risk || "").toLowerCase();
  if (normalized === "low") {
    return { tone: "green", label: "Low" };
  }
  if (normalized === "medium") {
    return { tone: "amber", label: "Medium" };
  }
  return { tone: "red", label: "High" };
}
