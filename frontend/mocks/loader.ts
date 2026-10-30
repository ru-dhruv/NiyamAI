import mockData from "./data.json";
import type {
  User,
  Business,
  Licence,
  LicenceRaw,
  LicenceStatus,
  Invoice,
  Flag,
  Rule,
  CalendarItem,
  TaxSavingSuggestion,
  RenewalOffice,
} from "./types";

/**
 * Computes dynamic licence status and days remaining based on expiry date.
 * STATUS IS NEVER STORED IN DATABASE, ONLY COMPUTED DYNAMICALLY HERE.
 * - Expired: expiry date is strictly in the past (< 0 days)
 * - Expiring: 30 days or fewer remaining (>= 0 and <= 30 days)
 * - Valid: more than 30 days remaining (> 30 days)
 */
export function computeLicenceStatus(expiryDateStr: string): {
  status: LicenceStatus;
  daysRemaining: number;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [year, month, day] = expiryDateStr.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);

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

/**
 * Loads current user data.
 */
export async function getUser(): Promise<User> {
  return mockData.user as User;
}

/**
 * Loads business compliance profile with computed health score & breakdown.
 */
export async function getBusiness(): Promise<Business> {
  return mockData.business as Business;
}

/**
 * Loads licences, computing status dynamically from expiry for each record.
 */
export async function getLicences(): Promise<Licence[]> {
  const rawList = mockData.licences as LicenceRaw[];
  return rawList.map((raw) => {
    const { status, daysRemaining } = computeLicenceStatus(raw.expiry);
    return {
      ...raw,
      status,
      daysRemaining,
    };
  });
}

/**
 * Finds a licence by ID with computed status.
 */
export async function getLicenceById(id: string): Promise<Licence | undefined> {
  const list = await getLicences();
  return list.find((lic) => lic.id === id);
}

/**
 * Loads all audited invoices with extracted fields and rule issues.
 */
export async function getInvoices(): Promise<Invoice[]> {
  return mockData.invoices as Invoice[];
}

/**
 * Finds an invoice by ID.
 */
export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const invoices = await getInvoices();
  return invoices.find((inv) => inv.id === id);
}

/**
 * Loads all CA collaboration flags with comments.
 */
export async function getFlags(): Promise<Flag[]> {
  return mockData.flags as Flag[];
}

/**
 * Finds a CA flag by ID.
 */
export async function getFlagById(id: string): Promise<Flag | undefined> {
  const flags = await getFlags();
  return flags.find((flag) => flag.id === id);
}

/**
 * Loads the canonical compliance rules table.
 */
export async function getRules(): Promise<Rule[]> {
  return mockData.rules as Rule[];
}

/**
 * Finds a rule by rule_code.
 */
export async function getRuleByCode(ruleCode: string): Promise<Rule | undefined> {
  const rules = await getRules();
  return rules.find(
    (rule) =>
      rule.rule_code.toUpperCase() === ruleCode.toUpperCase() ||
      // Also match aliases if needed
      (ruleCode === "TAX_AMOUNT_MISMATCH" && rule.rule_code === "TAX_AMOUNT_MISMATCH")
  );
}

/**
 * Loads calendar deadlines.
 */
export async function getCalendarItems(): Promise<CalendarItem[]> {
  return mockData.calendar as CalendarItem[];
}

/**
 * Loads proactive tax saving opportunities.
 */
export async function getTaxSavings(): Promise<TaxSavingSuggestion[]> {
  return mockData.taxSavings as TaxSavingSuggestion[];
}

/**
 * Loads nearby regulatory and renewal offices.
 */
export async function getRenewalOffices(): Promise<RenewalOffice[]> {
  return mockData.renewalOffices as RenewalOffice[];
}

