import type { Rule } from "@/mocks/types";
import { getRules } from "@/mocks/loader";

export interface ChatCitation {
  rule_code: string;
  title: string;
  legal_reference: string;
  penalty_formula: string;
  source_url: string;
  last_verified: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citation?: ChatCitation;
  timestamp: string;
}

const STATUTORY_RULES: Record<string, ChatCitation> = {
  FSSAI_EXPIRED: {
    rule_code: "FSSAI_EXPIRED",
    title: "Expired Food Business Operator (FSSAI) Licence",
    legal_reference: "Section 31 and Section 58 of Food Safety and Standards Act, 2006",
    penalty_formula: "Imprisonment up to 6 months and a statutory fine up to ₹5,00,000 for operating food business without active registration",
    source_url: "https://foscos.fssai.gov.in",
    last_verified: "2026-10-15",
  },
  FSSAI_EXPIRING: {
    rule_code: "FSSAI_EXPIRING",
    title: "FSSAI Renewal Due (Within 30 Days of Expiry)",
    legal_reference: "FSS (Licensing and Registration of Food Businesses) Regulations, 2011 (Reg. 2.1.7)",
    penalty_formula: "Mandatory ₹100 per day late fee if renewal application is not submitted at least 30 days prior to expiry date",
    source_url: "https://foscos.fssai.gov.in",
    last_verified: "2026-10-15",
  },
  FIRE_NOC_EXPIRED: {
    rule_code: "FIRE_NOC_EXPIRED",
    title: "Commercial Premises Fire Safety NOC Expired",
    legal_reference: "Madhya Pradesh Fire Safety Act & Municipal Building Bye-Laws",
    penalty_formula: "Immediate sealing of commercial kitchen premises and indicative municipal compound penalty up to ₹25,000",
    source_url: "https://fire.mp.gov.in",
    last_verified: "2026-10-10",
  },
  FIRE_NOC_EXPIRING: {
    rule_code: "FIRE_NOC_EXPIRING",
    title: "Fire NOC Annual Safety Audit Due",
    legal_reference: "National Building Code of India (NBC 2016 Part 4)",
    penalty_formula: "Mandatory annual physical equipment audit (fire extinguishers, hose reels) required prior to renewal clearance",
    source_url: "https://fire.mp.gov.in",
    last_verified: "2026-10-10",
  },
  TRADE_LIC_EXPIRED: {
    rule_code: "TRADE_LIC_EXPIRED",
    title: "Municipal Corporation Trade Licence Expired",
    legal_reference: "Bhopal Municipal Corporation Act, Section 366 & MP Nagar Palika Adhiniyam",
    penalty_formula: "Statutory fine of ₹500 plus 200% (2x) of normal renewal fees, or issuance of commercial closure notice",
    source_url: "https://bhopalmunicipal.com",
    last_verified: "2026-10-01",
  },
  GSTIN_INVALID: {
    rule_code: "GSTIN_INVALID",
    title: "Invalid Supplier GSTIN or Checksum Mismatch",
    legal_reference: "CGST Rules 2017, Rule 46(b) and Section 122(1)(i) of CGST Act",
    penalty_formula: "Complete disallowance of Input Tax Credit (ITC) under Section 16(2); penalty of ₹10,000 or tax amount evaded (whichever is higher) plus 18% p.a. interest",
    source_url: "https://gst.gov.in",
    last_verified: "2026-10-20",
  },
  TAX_AMOUNT_MISMATCH: {
    rule_code: "TAX_AMOUNT_MISMATCH",
    title: "Tax Calculation Mismatch on Purchase Invoice",
    legal_reference: "Section 33, Section 73 & Section 74 of CGST Act, 2017",
    penalty_formula: "Disallowance of excess/mismatched ITC; tax demand with mandatory interest under Section 50 and penalty of 10% or ₹10,000",
    source_url: "https://gst.gov.in",
    last_verified: "2026-10-20",
  },
  TOTAL_MISMATCH: {
    rule_code: "TOTAL_MISMATCH",
    title: "Invoice Total Mismatch (Taxable Value + Tax != Total)",
    legal_reference: "Rule 46(m) of CGST Rules, 2017",
    penalty_formula: "General statutory penalty up to ₹25,000 under Section 125 of CGST Act for non-compliant tax invoice issuance",
    source_url: "https://gst.gov.in",
    last_verified: "2026-10-20",
  },
};

/**
 * Detects if query is in Hindi (contains Devanagari characters)
 */
function isHindiQuery(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Answers compliance and statutory rule questions grounded strictly on official rules.
 */
export async function queryComplianceAssistant(
  query: string,
  currentLocale: string = "en"
): Promise<{ text: string; citation?: ChatCitation }> {
  // If in real mode and backend is connected, can attempt remote API
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!useMocks && apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, locale: currentLocale }),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          text: data.text || data.reply,
          citation: data.citation,
        };
      }
    } catch {
      // Fall through to deterministic client-side grounding
    }
  }

  // Simulate short typing delay for realistic interaction (500ms)
  await new Promise((res) => setTimeout(res, 450));

  const lower = query.toLowerCase();
  const isHindi = isHindiQuery(query) || currentLocale === "hi";

  // 1. FSSAI Expiry
  if (
    lower.includes("fssai") &&
    (lower.includes("expire") || lower.includes("expiring") || lower.includes("एक्सपायर") || lower.includes("लाइसेंस") || lower.includes("खाद्य") || lower.includes("रिन्यू") || lower.includes("renew"))
  ) {
    const citation = STATUTORY_RULES.FSSAI_EXPIRED;
    if (isHindi) {
      return {
        text: `खाद्य सुरक्षा और मानक अधिनियम (FSS Act) 2006 की धारा 31 के तहत, बिना सक्रिय FSSAI लाइसेंस के खाद्य व्यवसाय चलाने पर 6 महीने तक का कारावास और ₹5,00,000 तक का जुर्माना हो सकता है।\n\nनियम 2.1.7 के अनुसार, लाइसेंस समाप्ति से कम से कम 30 दिन पहले रिन्यूअल आवेदन करना अनिवार्य है। ऐसा न करने पर ₹100 प्रति दिन का अतिरिक्त विलंब शुल्क लगता है।`,
        citation,
      };
    }
    return {
      text: `Under Section 31 of the Food Safety and Standards Act 2006, operating a food business without an active FSSAI licence attracts imprisonment up to 6 months and a penalty of up to ₹5,00,000.\n\nAdditionally, under FSS Regulation 2.1.7, licence renewal must be submitted at least 30 days prior to expiry; otherwise, a statutory late fee of ₹100 per day is levied.`,
      citation,
    };
  }

  // 2. GSTIN Invalid / Checksum
  if (
    lower.includes("gstin") ||
    lower.includes("checksum") ||
    lower.includes("जीएसटी") ||
    lower.includes("gst number") ||
    (lower.includes("gst") && (lower.includes("invalid") || lower.includes("गलत") || lower.includes("penalty")))
  ) {
    const citation = STATUTORY_RULES.GSTIN_INVALID;
    if (isHindi) {
      return {
        text: `CGST नियमावली 2017 के नियम 46(b) और धारा 122(1)(i) के अनुसार, यदि खरीद इनवॉइस पर विक्रेता का GSTIN अमान्य है या Mod-36 चेकसम में त्रुटि है, तो धारा 16(2) के तहत आपका इनपुट टैक्स क्रेडिट (ITC) पूरी तरह निरस्त हो जाता है।\n\nइस पर ₹10,000 या कर राशि (जो भी अधिक हो) का जुर्माना और 18% वार्षिक ब्याज देय होता है।`,
        citation,
      };
    }
    return {
      text: `Under Rule 46(b) and Section 122(1)(i) of the CGST Act 2017, an invalid supplier GSTIN or Mod-36 checksum failure completely disallows your Input Tax Credit (ITC) claim under Section 16(2).\n\nIt attracts a mandatory penalty of ₹10,000 or the tax amount evaded (whichever is higher), along with 18% annual interest under Section 50.`,
      citation,
    };
  }

  // 3. Tax / Rate / Total Mismatch
  if (
    lower.includes("tax amount") ||
    lower.includes("calculation") ||
    lower.includes("rate") ||
    lower.includes("टैक्स") ||
    lower.includes("mismatch") ||
    lower.includes("total")
  ) {
    const citation = STATUTORY_RULES.TAX_AMOUNT_MISMATCH;
    if (isHindi) {
      return {
        text: `CGST अधिनियम 2017 की धारा 33 और 73/74 के अनुसार, इनवॉइस पर टैक्स राशि और कर दर (Taxable Value × Tax Rate) में अंतर होने पर संबंधित ITC अमान्य हो जाता है।\n\nविभाग द्वारा कर की मांग, धारा 50 के तहत ब्याज, और 10% या ₹10,000 का अर्थदंड लगाया जा सकता है।`,
        citation,
      };
    }
    return {
      text: `Under Sections 33, 73, and 74 of the CGST Act 2017, any mathematical disparity between the stated tax amount and (Taxable Value × Rate) makes the ITC claim defective.\n\nThe tax authorities can demand reversal of ITC along with statutory interest under Section 50 and a penalty of 10% of tax or ₹10,000.`,
      citation,
    };
  }

  // 4. Fire NOC
  if (
    lower.includes("fire") ||
    lower.includes("noc") ||
    lower.includes("अग्निशमन") ||
    lower.includes("आग")
  ) {
    const citation = STATUTORY_RULES.FIRE_NOC_EXPIRED;
    if (isHindi) {
      return {
        text: `मध्य प्रदेश अग्नि निवारण अधिनियम और नगर निगम बिल्डिंग बाय-लॉज़ के अनुसार, व्यावसायिक रेस्तरां व खाद्य प्रतिष्ठानों के पास वैध फायर सेफ्टी एनओसी होना अनिवार्य है।\n\nएनओसी समाप्त होने पर व्यावसायिक परिसर को सील किया जा सकता है और नगर निगम द्वारा ₹25,000 तक का कंपाउंड जुर्माना लगाया जा सकता है।`,
        citation,
      };
    }
    return {
      text: `Under the Madhya Pradesh Fire Safety Act and Municipal Building Bye-Laws, commercial restaurants and food establishments must maintain a valid annual Fire NOC.\n\nOperating with an expired Fire NOC can lead to immediate commercial sealing of premises and compound municipal penalties up to ₹25,000.`,
      citation,
    };
  }

  // 5. Trade Licence
  if (
    lower.includes("trade") ||
    lower.includes("municipal") ||
    lower.includes("व्यापार") ||
    lower.includes("नगर निगम") ||
    lower.includes("दुकान") ||
    lower.includes("shop")
  ) {
    const citation = STATUTORY_RULES.TRADE_LIC_EXPIRED;
    if (isHindi) {
      return {
        text: `भोपाल नगर निगम अधिनियम की धारा 366 के तहत, बिना नवीनीकृत ट्रेड लाइसेंस के व्यवसाय संचालन पर ₹500 का जुर्माना और सामान्य लाइसेंस शुल्क का 200% (2 गुना) विलंब शुल्क लगाया जाता है, अथवा प्रतिष्ठान बंद करने का नोटिस जारी होता है।`,
        citation,
      };
    }
    return {
      text: `Under Section 366 of the Bhopal Municipal Corporation Act, operating without a renewed Trade Licence attracts a statutory fine of ₹500 plus 200% (2x) of normal renewal fees, or issuance of a temporary closure notice.`,
      citation,
    };
  }

  // 6. ITC / Input Tax Credit
  if (lower.includes("itc") || lower.includes("input tax") || lower.includes("क्रेडिट")) {
    const citation = STATUTORY_RULES.GSTIN_INVALID;
    if (isHindi) {
      return {
        text: `जीएसटी कानून की धारा 16(2) के अनुसार, ITC का दावा तभी मान्य होता है जब: (1) विक्रेता का GSTIN सक्रिय व सही हो, (2) टैक्स इनवॉइस वैध हो, और (3) टैक्स राशि का हिसाब नियमानुसार सही हो।\n\nNiyamAI इनवॉइस अपलोड पर इन सभी नियमों की स्वचालित जांच करता है।`,
        citation,
      };
    }
    return {
      text: `Under Section 16(2) of the CGST Act, Input Tax Credit (ITC) is strictly contingent upon: (1) a valid, checksum-verified supplier GSTIN, (2) a compliant tax invoice, and (3) mathematically accurate tax calculations.\n\nNiyamAI automatically audits these mathematical criteria on every uploaded purchase invoice.`,
      citation,
    };
  }

  // 7. General Health Score
  if (
    lower.includes("score") ||
    lower.includes("स्कोर") ||
    lower.includes("health") ||
    lower.includes("हेल्थ")
  ) {
    if (isHindi) {
      return {
        text: `NiyamAI कम्पलायंस हेल्थ स्कोर (100 में से) तीन श्रेणियों से निर्धारित होता है:\n1. अनिवार्य लाइसेंस स्थिति (50 अंक) — FSSAI, फायर एनओसी, ट्रेड लाइसेंस\n2. जीएसटी इनवॉइस शुद्धता (35 अंक) — GSTIN चेकसम व टैक्स गणित\n3. सीए फ्लैग व समय पर समाधान (15 अंक)\n\nसमाप्त लाइसेंस रिन्यू करके या इनवॉइस विसंगतियों को ठीक करके आप अपना स्कोर 90+ तक बढ़ा सकते हैं।`,
      };
    }
    return {
      text: `The NiyamAI Compliance Health Score (out of 100) is deterministically calculated from:\n1. Mandatory Licences (50 pts) — FSSAI, Fire NOC, Trade Licence\n2. GST Invoice Quality (35 pts) — Mod-36 checksum, tax rate & total math\n3. CA Advice Resolution (15 pts) — Open vs resolved audit flags\n\nRenewing expiring licences and addressing flagged invoice issues will immediately boost your score towards 90+.`,
    };
  }

  // 8. Unmatched / Fallback
  if (isHindi) {
    return {
      text: `मेरे पास अभी इस सवाल का आधिकारिक नियम NiyamAI डेटाबेस में उपलब्ध नहीं है।\n\nसटीक विधिक या कर मार्गदर्शन के लिए कृपया इनवॉइस या लाइसेंस पर 'Flag to CA' विकल्प चुनकर अपने सीए (Chartered Accountant) से परामर्श करें।`,
    };
  }
  return {
    text: `I do not have a verified statutory rule for this specific query in the current rule ledger.\n\nFor authoritative tax or legal counsel, please use the "Flag to CA" feature on your invoice or licence to consult your Chartered Accountant directly.`,
  };
}

