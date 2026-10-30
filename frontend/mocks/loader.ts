import mockData from "./data.json";
import {
  User,
  Business,
  Licence,
  Invoice,
  Flag,
  Rule,
  CalendarItem,
  TaxSavingSuggestion,
  RenewalOffice,
  computeLicenceStatus,
} from "./types";
import {
  listLicences,
  listInvoices,
  listFlags,
  getRules as apiGetRules,
  getBusinessProfile,
} from "@/lib/api";

export { computeLicenceStatus };

/**
 * Loads current user data.
 */
export async function getUser(): Promise<User> {
  return mockData.user as User;
}

/**
 * Loads business compliance profile with computed health score & breakdown.
 */
export async function getBusiness(businessId: string = "biz_001"): Promise<Business> {
  return getBusinessProfile(businessId);
}

/**
 * Loads licences, computing status dynamically from expiry for each record.
 */
export async function getLicences(businessId: string = "biz_001"): Promise<Licence[]> {
  return listLicences(businessId);
}

/**
 * Finds a licence by ID with computed status.
 */
export async function getLicenceById(id: string, businessId: string = "biz_001"): Promise<Licence | undefined> {
  const list = await listLicences(businessId);
  return list.find((lic) => lic.id === id);
}

/**
 * Loads all audited invoices with extracted fields and rule issues.
 */
export async function getInvoices(businessId: string = "biz_001"): Promise<Invoice[]> {
  return listInvoices(businessId);
}

/**
 * Finds an invoice by ID.
 */
export async function getInvoiceById(id: string, businessId: string = "biz_001"): Promise<Invoice | undefined> {
  const invoices = await listInvoices(businessId);
  return invoices.find((inv) => inv.id === id);
}

/**
 * Loads all CA collaboration flags with comments.
 */
export async function getFlags(businessId: string = "biz_001"): Promise<Flag[]> {
  return listFlags(businessId);
}

/**
 * Finds a CA flag by ID.
 */
export async function getFlagById(id: string, businessId: string = "biz_001"): Promise<Flag | undefined> {
  const flags = await listFlags(businessId);
  return flags.find((flag) => flag.id === id);
}

/**
 * Loads the canonical compliance rules table.
 */
export async function getRules(): Promise<Rule[]> {
  return apiGetRules();
}

/**
 * Finds a rule by rule_code.
 */
export async function getRuleByCode(ruleCode: string): Promise<Rule | undefined> {
  const rules = await getRules();
  return rules.find(
    (rule) => rule.rule_code.toUpperCase() === ruleCode.toUpperCase()
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
