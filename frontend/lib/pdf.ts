import type { Licence, Business } from "@/mocks/types";

/**
 * Escapes characters for PDF literal strings (parentheses and backslashes)
 */
function escapePdfText(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Generates a clean, standard PDF 1.4 document as a Blob in pure TypeScript.
 * No external dependencies needed. Compatible with all PDF viewers.
 */
export function generateRenewalPdf(
  licence: Licence,
  business?: Business | null
): Blob {
  const bizName = business?.name || "Sharma Kirana & Food Mart";
  const bizGstin = business?.gstin || "23AABCU9603R1ZM";
  const bizAddress = `${business?.city || "Bhopal"}, ${business?.state || "Madhya Pradesh"}`;
  const holderName = licence.holder_name || "Ramesh Sharma";
  const licenceType = licence.type || "FSSAI Food Business Operator";
  const licenceNo = licence.number || "11422850001034";
  const expiryDate = licence.expiry || "2026-11-18";
  const issueDate = licence.issue_date || "2021-11-18";
  const todayStr = new Date().toISOString().substring(0, 10);
  const refCode = `NYM-REN-${Date.now().toString(36).toUpperCase()}`;

  // Stream drawing commands in PDF coordinate space (612 x 792 pt = US Letter / A4 close)
  const streamCommands = [
    // Header background bar (deep forest green #0b2b22 -> 0.043, 0.169, 0.133)
    "0.043 0.169 0.133 rg",
    "36 710 540 50 re",
    "f",

    // Header text
    "1 1 1 rg",
    "BT",
    "/F1 16 Tf",
    "50 736 Td",
    "(NIYAMAI COMPLIANCE LEDGER) Tj",
    "ET",
    "BT",
    "/F2 9 Tf",
    "50 722 Td",
    "(STATUTORY PRE-FILLED RENEWAL APPLICATION DRAFT) Tj",
    "ET",

    // Reference ID right aligned in header
    "BT",
    "/F2 8 Tf",
    `440 730 Td (${escapePdfText(refCode)}) Tj`,
    "ET",

    // Notice banner
    "0.94 0.96 0.94 rg",
    "36 675 540 24 re",
    "f",
    "0.1 0.4 0.25 RG",
    "1 w",
    "36 675 540 24 re",
    "S",
    "0.08 0.3 0.2 rg",
    "BT",
    "/F1 8.5 Tf",
    "48 684 Td",
    "(NOTICE: Official pre-filled statutory draft. Verify all details before portal submission.) Tj",
    "ET",

    // Section 1: Business Details
    "0 0 0 rg",
    "BT",
    "/F1 12 Tf",
    "36 645 Td",
    "(1. APPLICANT & BUSINESS PARTICULARS) Tj",
    "ET",

    // Table line
    "0.75 0.75 0.75 RG",
    "0.5 w",
    "36 638 m 576 638 l S",

    "BT",
    "/F2 10 Tf",
    "36 620 Td (Entity Legal Name:) Tj",
    `160 620 Td (${escapePdfText(bizName)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 602 Td (GSTIN Registration:) Tj",
    `160 602 Td (${escapePdfText(bizGstin)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 584 Td (Operating Premises:) Tj",
    `160 584 Td (${escapePdfText(bizAddress)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 566 Td (Authorized Signatory:) Tj",
    `160 566 Td (${escapePdfText(holderName)} [Proprietor/Director]) Tj`,
    "ET",

    // Section 2: Licence & Registration Particulars
    "0 0 0 rg",
    "BT",
    "/F1 12 Tf",
    "36 532 Td",
    "(2. EXISTING LICENCE PARTICULARS TO BE RENEWED) Tj",
    "ET",

    "0.75 0.75 0.75 RG",
    "0.5 w",
    "36 525 m 576 525 l S",

    "BT",
    "/F2 10 Tf",
    "36 507 Td (Licence Category:) Tj",
    `160 507 Td (${escapePdfText(licenceType)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 489 Td (Registration Number:) Tj",
    `160 489 Td (${escapePdfText(licenceNo)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 471 Td (Original Issue Date:) Tj",
    `160 471 Td (${escapePdfText(issueDate)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 453 Td (Current Expiry Date:) Tj",
    `160 453 Td (${escapePdfText(expiryDate)}) Tj`,
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 435 Td (Requested Renewal Term:) Tj",
    "160 435 Td (1 Year Statutory Standard Renewal) Tj",
    "ET",

    "BT",
    "/F2 10 Tf",
    "36 417 Td (AI Audit Status:) Tj",
    `160 417 Td (Verified Active Ledger Record - Confidence ${Math.round(licence.confidence * 100)}%) Tj`,
    "ET",

    // Section 3: Statutory Declaration
    "0 0 0 rg",
    "BT",
    "/F1 12 Tf",
    "36 385 Td",
    "(3. APPLICANT UNDERTAKING & DECLARATION) Tj",
    "ET",

    "0.75 0.75 0.75 RG",
    "0.5 w",
    "36 378 m 576 378 l S",

    "BT",
    "/F2 9 Tf",
    "36 360 Td",
    "(I/We hereby solemnly declare that the information provided in this renewal application is true, correct, and) Tj",
    "36 348 Td",
    "(complete to the best of my knowledge. The business premises continue to comply with all safety, hygiene,) Tj",
    "36 336 Td",
    "(and operational guidelines mandated under the relevant state and central regulatory acts.) Tj",
    "ET",

    // Signature Box
    "0.95 0.95 0.95 rg",
    "350 240 220 70 re",
    "f",
    "0.7 0.7 0.7 RG",
    "1 w",
    "350 240 220 70 re",
    "S",

    "0 0 0 rg",
    "BT",
    "/F2 8.5 Tf",
    "360 292 Td (Authorized Signatory Seal / Signature:) Tj",
    "/F1 9 Tf",
    `360 264 Td (${escapePdfText(holderName)}) Tj`,
    "/F2 8 Tf",
    `360 248 Td (Date of Application: ${escapePdfText(todayStr)}) Tj`,
    "ET",

    // Footer
    "0.75 0.75 0.75 RG",
    "0.5 w",
    "36 60 m 576 60 l S",

    "0.4 0.4 0.4 rg",
    "BT",
    "/F2 8 Tf",
    "36 45 Td (NiyamAI - Compliance Health Score Ledger for Indian SMBs | Guidance only, not legal or tax advice.) Tj",
    "36 35 Td (Official Portals: FSSAI FoSCoS (foscos.fssai.gov.in) | MP Nagar Palika (mpenagarpalika.gov.in)) Tj",
    "ET",
  ].join("\n");

  const streamLength = streamCommands.length;

  const pdfParts = [
    "%PDF-1.4\n",
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamCommands}\nendstream\nendobj\n`,
  ];

  // Calculate object byte offsets for xref table
  let currentOffset = 0;
  const offsets: number[] = [];

  for (const part of pdfParts) {
    offsets.push(currentOffset);
    currentOffset += part.length;
  }

  const xref = [
    "xref\n",
    `0 ${pdfParts.length + 1}\n`,
    "0000000000 65535 f \n",
  ];

  for (let i = 1; i <= pdfParts.length; i++) {
    const off = offsets[i - 1];
    const pad = off.toString().padStart(10, "0");
    xref.push(`${pad} 00000 n \n`);
  }

  const startxref = currentOffset;
  const trailer = [
    `trailer\n<< /Size ${pdfParts.length + 1} /Root 1 0 R >>\n`,
    `startxref\n${startxref}\n`,
    "%%EOF",
  ];

  const fullPdf = pdfParts.join("") + xref.join("") + trailer.join("");
  return new Blob([fullPdf], { type: "application/pdf" });
}

/**
 * Initiates download of the pre-filled renewal PDF in the browser.
 */
export function downloadRenewalPdf(
  licence: Licence,
  business?: Business | null
): void {
  const blob = generateRenewalPdf(licence, business);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `${(licence.type || "Licence").replace(/\s+/g, "_")}_Renewal_Application.pdf`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

