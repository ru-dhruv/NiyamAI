export type UserRole = "owner" | "ca";

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  language: string;
  businessIds: string[];
}

export interface ScoreBreakdownItem {
  label: string;
  pointsLost: number;
  max: number;
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
  scoreBreakdown: ScoreBreakdownItem[];
}

export type LicenceStatus = "valid" | "expiring" | "expired";

/**
 * Raw licence record stored in database (status is NEVER stored here).
 */
export interface LicenceRaw {
  id: string;
  type: string;
  number: string;
  expiry: string; // YYYY-MM-DD
  confidence: number;
  holder_name?: string;
  issue_date?: string;
  fileUrl?: string;
}

/**
 * Computed licence record returned by loader with dynamic status.
 */
export interface Licence extends LicenceRaw {
  status: LicenceStatus;
  daysRemaining: number;
}

export interface ExtractedInvoice {
  invoice_number: string;
  date: string;
  seller_gstin: string;
  buyer_gstin: string | null;
  taxable_value: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
}

export interface InvoiceIssue {
  rule_code: string;
  message: string;
}

export type InvoiceRisk = "low" | "medium" | "high";

export interface Invoice {
  id: string;
  extracted: ExtractedInvoice;
  issues: InvoiceIssue[];
  risk: InvoiceRisk;
  status?: "active" | "fixed" | "flagged";
}

export interface FlagComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Flag {
  id: string;
  itemRef: string;
  note: string;
  status: "open" | "needs-info" | "resolved";
  createdBy: string;
  createdAt: string;
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

