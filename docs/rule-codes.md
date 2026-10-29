# NiyamAI Canonical Rule Codes

Agreed rule codes per Build Specification Part 5, Section 5.5.
Both Backend (Member B) and Rule Engine / Assistant (Member C) must strictly use these exact strings.

| Rule Code | Category | Trigger / Condition | Standard Severity |
| :--- | :--- | :--- | :--- |
| `GSTIN_INVALID` | Invoices / GST | Format regex fails or Mod-36 check character mismatch | High |
| `TAX_CALCULATION_MISMATCH` | Invoices / GST | Tax amount != taxable_value * tax_rate (beyond tolerance) | Medium / High |
| `TOTAL_MISMATCH` | Invoices / GST | Total != taxable_value + tax_amount (beyond tolerance) | High |
| `CURRENCY_NON_INR` | Invoices / GST | Currency is not INR for domestic supply | Medium |
| `FSSAI_EXPIRED` | Licences | FSSAI licence expiry date has passed | High |
| `FSSAI_MISSING` | Licences | Food business missing mandatory FSSAI registration | High |
| `TRADE_LIC_LAPSE` | Licences | Municipal Trade Licence expired or not renewed | Medium / High |
| `FIRE_NOC_EXPIRED` | Licences | Commercial premises Fire NOC has expired | High |
| `OVERDUE_DEADLINE` | Calendar | Statutory filing deadline has passed without filing | Medium |
| `CA_FLAG_OVERDUE` | CA Flags | Open CA flag unresolved for more than 7 days | Medium |

