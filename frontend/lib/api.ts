import initialData from "@/mocks/data.json";
import {
  Licence,
  LicenceRaw,
  LicenceScanResult,
  SaveLicenceInput,
  Invoice,
  InvoiceAuditResult,
  SaveInvoiceInput,
  ScoreBreakdownItem,
  Business,
  Flag,
  FlagStatus,
  FlagComment,
  Rule,
  computeLicenceStatus,
  scanResultToLicence,
} from "@/mocks/types";
import { getAuthToken } from "./auth";

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS === undefined
    ? true
    : process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── In-Memory Mock Store (Persists during session) ───────────────────────────
let mockBusiness: Business = {
  ...initialData.business,
  scoreBreakdown: initialData.business.scoreBreakdown.map((b) => ({
    ...b,
    score: b.max - b.lost,
  })),
};

let mockLicences: LicenceRaw[] = [...initialData.licences];
let mockInvoices: Invoice[] = [...(initialData.invoices as Invoice[])];
let mockFlags: Flag[] = [...(initialData.flags as Flag[])];
const mockRules: Rule[] = [...initialData.rules];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Dynamic Client-side Score Recomputation ──────────────────────────────────
function computeCurrentScore(): {
  healthScore: number;
  scoreBreakdown: ScoreBreakdownItem[];
  penaltyExposure: number;
  scoreUpdatedAt: string;
} {
  // 1. Licences (Max 40)
  let licenceLost = 0;
  const licenceReasons: string[] = [];
  let penaltyExposure = 0;

  mockLicences.forEach((lic) => {
    const { status, daysRemaining } = computeLicenceStatus(lic.expiry);
    if (status === "expired") {
      licenceLost += 15;
      penaltyExposure += 25000;
      licenceReasons.push(`${lic.type}: Expired on ${lic.expiry}`);
    } else if (status === "expiring") {
      licenceLost += 5;
      licenceReasons.push(`${lic.type}: Expiring in ${daysRemaining} days`);
    }
  });
  licenceLost = Math.min(licenceLost, 40);
  const licenceScore = 40 - licenceLost;
  if (licenceReasons.length === 0) {
    licenceReasons.push("All tracked licences are active and valid");
  }

  // 2. Invoices (Max 30)
  let invoiceLost = 0;
  const invoiceReasons: string[] = [];
  mockInvoices.forEach((inv) => {
    if (inv.status !== "fixed") {
      if (inv.risk === "High") {
        invoiceLost += 10;
        invoiceReasons.push(`High risk invoice ${inv.extracted.invoice_number}`);
      } else if (inv.risk === "Medium") {
        invoiceLost += 5;
        invoiceReasons.push(`Medium risk invoice ${inv.extracted.invoice_number}`);
      }
    }
  });
  invoiceLost = Math.min(invoiceLost, 30);
  const invoiceScore = 30 - invoiceLost;
  if (invoiceReasons.length === 0) {
    invoiceReasons.push("All recent invoices passed compliance audits");
  }

  // 3. CA Flags (Max 15)
  let flagLost = 0;
  const flagReasons: string[] = [];
  const openFlags = mockFlags.filter((f) => f.status === "open");
  if (openFlags.length > 0) {
    flagLost = Math.min(openFlags.length * 8, 15);
    flagReasons.push(`${openFlags.length} open flag(s) pending CA resolution`);
  } else {
    flagReasons.push("No unresolved CA flags");
  }
  const flagScore = 15 - flagLost;

  // 4. Filings (Max 15)
  const filingLost = 0;
  const filingScore = 15;
  const filingReasons = ["All monthly statutory returns filed on time"];

  const totalHealthScore = licenceScore + invoiceScore + flagScore + filingScore;

  const scoreBreakdown: ScoreBreakdownItem[] = [
    {
      category: "Licences",
      score: licenceScore,
      max: 40,
      lost: licenceLost,
      reasons: licenceReasons,
    },
    {
      category: "Invoices",
      score: invoiceScore,
      max: 30,
      lost: invoiceLost,
      reasons: invoiceReasons,
    },
    {
      category: "CA Flags",
      score: flagScore,
      max: 15,
      lost: flagLost,
      reasons: flagReasons,
    },
    {
      category: "Filing Deadlines",
      score: filingScore,
      max: 15,
      lost: filingLost,
      reasons: filingReasons,
    },
  ];

  mockBusiness = {
    ...mockBusiness,
    healthScore: totalHealthScore,
    penaltyExposure,
    scoreBreakdown,
    scoreUpdatedAt: new Date().toISOString(),
  };

  return {
    healthScore: totalHealthScore,
    scoreBreakdown,
    penaltyExposure,
    scoreUpdatedAt: mockBusiness.scoreUpdatedAt,
  };
}

// ── 1. Licences Endpoints ───────────────────────────────────────────────────

export async function scanLicence(
  file: File | Blob | string,
  businessId: string
): Promise<LicenceScanResult> {
  if (USE_MOCKS) {
    await sleep(1500); // 1.5s simulated scan

    const fileName = typeof file === "string" ? file : file instanceof File ? file.name : "";
    const lower = fileName.toLowerCase();

    // 5 Distinct sample behaviours
    if (lower.includes("blurry") || lower.includes("low-conf")) {
      return {
        licence_type: "FSSAI",
        licence_number: "1001401100XXXX",
        holder_name: "Sharma Kirana",
        issue_date: "2021-11-19",
        expiry_date: "2026-11-18",
        confidence: 0.42,
        is_licence: true,
        warnings: ["Image is blurry or low-resolution: dates and numbers may be inaccurate"],
        errors: [],
      };
    }
    if (lower.includes("non-licence") || lower.includes("fake") || lower.includes("receipt")) {
      return {
        licence_type: "Unknown",
        licence_number: "",
        holder_name: null,
        issue_date: null,
        expiry_date: null,
        confidence: 0.12,
        is_licence: false,
        warnings: [],
        errors: ["This does not look like a licence. Please upload an official certificate."],
      };
    }
    if (lower.includes("fire")) {
      return {
        licence_type: "Fire NOC",
        licence_number: "MP-BPL-FIRE-2023-8821",
        holder_name: "Sharma Kirana",
        issue_date: "2023-04-01",
        expiry_date: "2026-03-31",
        confidence: 0.91,
        is_licence: true,
        warnings: [],
        errors: [],
      };
    }
    if (lower.includes("trade")) {
      return {
        licence_type: "Trade Licence",
        licence_number: "BMC-TRD-2025-00492",
        holder_name: "Ramesh Sharma",
        issue_date: "2025-01-01",
        expiry_date: "2027-12-31",
        confidence: 0.98,
        is_licence: true,
        warnings: [],
        errors: [],
      };
    }
    // Default: FSSAI expiring in 20 days
    return {
      licence_type: "FSSAI",
      licence_number: "10014011001234",
      holder_name: "Sharma Kirana & Food Mart",
      issue_date: "2021-11-19",
      expiry_date: "2026-11-18",
      confidence: 0.96,
      is_licence: true,
      warnings: [],
      errors: [],
    };
  }

  // Real Mode: multipart FormData with "file" and "business_id"
  const formData = new FormData();
  if (typeof file === "string") {
    formData.append("file_url", file);
  } else {
    formData.append("file", file);
  }
  formData.append("business_id", businessId);

  const res = await fetch(`${API_URL}/licences/scan`, {
    method: "POST",
    headers: {
      Authorization: getAuthToken(),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to scan licence: ${res.statusText}`);
  }
  return res.json();
}

export async function saveLicence(data: SaveLicenceInput): Promise<Licence> {
  if (USE_MOCKS) {
    await sleep(250);
    const newId = `lic_${Date.now()}`;
    const raw: LicenceRaw = {
      id: newId,
      type: data.type,
      number: data.number,
      expiry: data.expiry,
      confidence: data.confidence,
      holder_name: data.holder_name ?? null,
      issue_date: data.issue_date ?? null,
      fileUrl: data.fileUrl ?? null,
      createdAt: new Date().toISOString(),
    };
    mockLicences.push(raw);
    computeCurrentScore();

    const { status, daysRemaining } = computeLicenceStatus(raw.expiry);
    return {
      ...raw,
      status,
      daysRemaining,
    };
  }

  const res = await fetch(`${API_URL}/licences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthToken(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to save licence: ${res.statusText}`);
  }
  return res.json();
}

export async function listLicences(businessId: string): Promise<Licence[]> {
  if (USE_MOCKS) {
    await sleep(150);
    return mockLicences.map((raw) => {
      const { status, daysRemaining } = computeLicenceStatus(raw.expiry);
      return {
        ...raw,
        status,
        daysRemaining,
      };
    });
  }

  const res = await fetch(`${API_URL}/licences?business_id=${encodeURIComponent(businessId)}`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to list licences");
  const data: LicenceRaw[] = await res.json();
  return data.map((raw) => {
    const { status, daysRemaining } = computeLicenceStatus(raw.expiry);
    return { ...raw, status, daysRemaining };
  });
}

export async function deleteLicence(
  id: string,
  businessId: string
): Promise<{ success: boolean; healthScore: number }> {
  if (USE_MOCKS) {
    await sleep(200);
    mockLicences = mockLicences.filter((l) => l.id !== id);
    const { healthScore } = computeCurrentScore();
    return { success: true, healthScore };
  }

  const res = await fetch(
    `${API_URL}/licences/${encodeURIComponent(id)}?business_id=${encodeURIComponent(businessId)}`,
    {
      method: "DELETE",
      headers: { Authorization: getAuthToken() },
    }
  );
  if (!res.ok) throw new Error("Failed to delete licence");
  return res.json();
}

// ── 2. Invoices Endpoints ───────────────────────────────────────────────────

export async function auditInvoice(
  file: File | Blob | string,
  businessId: string
): Promise<InvoiceAuditResult> {
  if (USE_MOCKS) {
    await sleep(1200);
    const fileName = typeof file === "string" ? file : file instanceof File ? file.name : "";
    const lower = fileName.toLowerCase();

    if (lower.includes("clean") || lower.includes("low")) {
      return {
        extracted: {
          invoice_number: `INV-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split("T")[0],
          seller_gstin: "23AABCU9603R1ZJ",
          buyer_gstin: "23XYZAB5678K1Z2",
          taxable_value: 15000.0,
          tax_rate: 0.18,
          tax_amount: 2700.0,
          total: 17700.0,
          currency: "INR",
        },
        issues: [],
        risk: "Low",
      };
    }

    if (lower.includes("tax") || lower.includes("mismatch") || lower.includes("medium")) {
      return {
        extracted: {
          invoice_number: `SUP-${Date.now().toString().slice(-5)}`,
          date: new Date().toISOString().split("T")[0],
          seller_gstin: "23ABCDE1234F1Z5",
          buyer_gstin: "23AABCU9603R1ZJ",
          taxable_value: 20000.0,
          tax_rate: 0.12,
          tax_amount: 2600.0,
          total: 22600.0,
          currency: "INR",
        },
        issues: [
          {
            rule_code: "TAX_AMOUNT_MISMATCH",
            field: "tax_amount",
            message: "Tax amount (₹2,600) exceeds taxable_value × 12% (expected ₹2,400)",
            severity: "Medium",
          },
        ],
        risk: "Medium",
      };
    }

    // Default: Bad GSTIN Checksum
    return {
      extracted: {
        invoice_number: `INV-2026-${Date.now().toString().slice(-3)}`,
        date: new Date().toISOString().split("T")[0],
        seller_gstin: "27AAACR4849R4ZX",
        buyer_gstin: "23AABCU9603R1ZJ",
        taxable_value: 45000.0,
        tax_rate: 0.18,
        tax_amount: 8100.0,
        total: 53100.0,
        currency: "INR",
      },
      issues: [
        {
          rule_code: "GSTIN_INVALID",
          field: "seller_gstin",
          message: "Seller GSTIN '27AAACR4849R4ZX' fails Mod-36 checksum validation.",
          severity: "High",
        },
      ],
      risk: "High",
    };
  }

  const formData = new FormData();
  if (typeof file === "string") {
    formData.append("file_url", file);
  } else {
    formData.append("file", file);
  }
  formData.append("business_id", businessId);

  const res = await fetch(`${API_URL}/invoices/audit`, {
    method: "POST",
    headers: { Authorization: getAuthToken() },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to audit invoice");
  return res.json();
}

export async function saveInvoice(data: SaveInvoiceInput): Promise<Invoice> {
  if (USE_MOCKS) {
    await sleep(200);
    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      extracted: data.extracted,
      issues: data.issues,
      risk: data.risk,
      status: "active",
      fileUrl: data.fileUrl ?? null,
      createdAt: new Date().toISOString(),
    };
    mockInvoices.unshift(newInv);
    computeCurrentScore();
    return newInv;
  }

  const res = await fetch(`${API_URL}/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthToken(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save invoice");
  return res.json();
}

export async function listInvoices(
  businessId: string,
  risk?: "Low" | "Medium" | "High"
): Promise<Invoice[]> {
  if (USE_MOCKS) {
    await sleep(150);
    if (!risk) return mockInvoices;
    return mockInvoices.filter((inv) => inv.risk === risk);
  }

  let url = `${API_URL}/invoices?business_id=${encodeURIComponent(businessId)}`;
  if (risk) url += `&risk=${encodeURIComponent(risk)}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to list invoices");
  return res.json();
}

export async function markInvoiceFixed(id: string, businessId: string): Promise<Invoice> {
  if (USE_MOCKS) {
    await sleep(200);
    const inv = mockInvoices.find((i) => i.id === id);
    if (!inv) throw new Error("Invoice not found");
    inv.status = "fixed";
    computeCurrentScore();
    return inv;
  }

  const res = await fetch(
    `${API_URL}/invoices/${encodeURIComponent(id)}/status?business_id=${encodeURIComponent(
      businessId
    )}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthToken(),
      },
      body: JSON.stringify({ status: "fixed" }),
    }
  );
  if (!res.ok) throw new Error("Failed to mark invoice fixed");
  return res.json();
}

// ── 3. Compliance Health Score ──────────────────────────────────────────────

export async function recomputeScore(businessId: string): Promise<{
  healthScore: number;
  scoreBreakdown: ScoreBreakdownItem[];
  penaltyExposure: number;
  scoreUpdatedAt: string;
}> {
  if (USE_MOCKS) {
    await sleep(200);
    return computeCurrentScore();
  }

  const res = await fetch(`${API_URL}/score/recompute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthToken(),
    },
    body: JSON.stringify({ business_id: businessId }),
  });
  if (!res.ok) throw new Error("Failed to recompute score");
  return res.json();
}

export async function getBusinessProfile(businessId: string): Promise<Business> {
  if (USE_MOCKS) {
    await sleep(100);
    return mockBusiness;
  }
  const res = await fetch(`${API_URL}/businesses/${encodeURIComponent(businessId)}`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to get business profile");
  return res.json();
}

// ── 4. Flags (CA Workflow) ──────────────────────────────────────────────────

export async function createFlag(data: {
  business_id: string;
  itemRef: string;
  note: string;
}): Promise<Flag> {
  if (USE_MOCKS) {
    await sleep(200);
    const newFlag: Flag = {
      id: `flag_${Date.now()}`,
      itemRef: data.itemRef,
      note: data.note,
      status: "open",
      createdBy: "usr_001",
      createdAt: new Date().toISOString(),
      comments: [],
    };
    mockFlags.unshift(newFlag);

    // If itemRef is an invoice, mark status flagged
    const invId = data.itemRef.replace("invoices/", "");
    const targetInv = mockInvoices.find((i) => i.id === invId);
    if (targetInv) {
      targetInv.status = "flagged";
    }

    computeCurrentScore();
    return newFlag;
  }

  const res = await fetch(`${API_URL}/flags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthToken(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create flag");
  return res.json();
}

export async function listFlags(businessId: string, status?: FlagStatus): Promise<Flag[]> {
  if (USE_MOCKS) {
    await sleep(150);
    if (!status) return mockFlags;
    return mockFlags.filter((f) => f.status === status);
  }

  let url = `${API_URL}/flags?business_id=${encodeURIComponent(businessId)}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to list flags");
  return res.json();
}

export async function addFlagComment(
  flagId: string,
  businessId: string,
  text: string
): Promise<FlagComment> {
  if (USE_MOCKS) {
    await sleep(150);
    const flag = mockFlags.find((f) => f.id === flagId);
    if (!flag) throw new Error("Flag not found");
    const comment: FlagComment = {
      id: `comm_${Date.now()}`,
      author: "CA Rajesh Verma",
      authorUid: "usr_ca_001",
      authorRole: "CA",
      text,
      createdAt: new Date().toISOString(),
    };
    flag.comments.push(comment);
    return comment;
  }

  const res = await fetch(
    `${API_URL}/flags/${encodeURIComponent(flagId)}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthToken(),
      },
      body: JSON.stringify({ business_id: businessId, text }),
    }
  );
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

export async function setFlagStatus(
  flagId: string,
  businessId: string,
  status: FlagStatus
): Promise<Flag> {
  if (USE_MOCKS) {
    await sleep(200);
    const flag = mockFlags.find((f) => f.id === flagId);
    if (!flag) throw new Error("Flag not found");
    flag.status = status;
    computeCurrentScore();
    return flag;
  }

  const res = await fetch(
    `${API_URL}/flags/${encodeURIComponent(flagId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthToken(),
      },
      body: JSON.stringify({ business_id: businessId, status }),
    }
  );
  if (!res.ok) throw new Error("Failed to set flag status");
  return res.json();
}

// ── 5. Rules Endpoints ──────────────────────────────────────────────────────

export async function getRules(): Promise<Rule[]> {
  if (USE_MOCKS) {
    await sleep(100);
    return mockRules;
  }

  const res = await fetch(`${API_URL}/rules`, {
    headers: { Authorization: getAuthToken() },
  });
  if (!res.ok) throw new Error("Failed to fetch rules");
  return res.json();
}

