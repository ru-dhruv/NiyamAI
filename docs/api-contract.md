# NiyamAI API Contract

Agreed REST API contracts for FastAPI backend per Build Specification Part 1, Section 1.5.

Base URL: `http://localhost:8000`
Docs URL: `http://localhost:8000/docs`

---

## 1. Licences

### `POST /licences/scan`
Uploads a licence photo/PDF or storage path, extracts data via Gemini, and returns validated editable fields.
- **Request Body (JSON or Multipart Form)**:
```json
{
  "business_id": "biz_001",
  "storage_path": "businesses/biz_001/licences/fssai_doc.jpg",
  "file_url": "https://...",
  "fallback_data": null
}
```
- **Response Body (200 OK)**:
```json
{
  "licence_type": "FSSAI",
  "licence_number": "10014011001234",
  "holder_name": "Niyam Enterprises",
  "issue_date": "2024-04-01",
  "expiry_date": "2027-03-31",
  "confidence": 0.95,
  "status": "valid",
  "is_licence": true,
  "warnings": [],
  "errors": []
}
```

### `POST /licences`
Saves confirmed licence and triggers score recompute.
- **Request Body**:
```json
{
  "business_id": "biz_001",
  "type": "FSSAI",
  "number": "10014011001234",
  "expiry": "2027-03-31",
  "fileUrl": "https://...",
  "confidence": 0.95,
  "holder_name": "Niyam Enterprises",
  "issue_date": "2024-04-01"
}
```
- **Response Body (200 OK)**:
```json
{
  "id": "lic_uuid",
  "type": "FSSAI",
  "number": "10014011001234",
  "expiry": "2027-03-31",
  "status": "valid",
  "healthScore": 75
}
```

### `GET /licences?business_id=biz_001`
- **Response Body**: Array of licence objects with dynamic `status` (`valid`, `expiring`, `expired`).

### `DELETE /licences/{id}?business_id=biz_001`
Deletes licence and recomputes score.

---

## 2. Invoices

### `POST /invoices/audit`
Uploads an invoice or provides data, extracts fields via Gemini, and runs pure Python rule checks.
- **Request Body**:
```json
{
  "business_id": "biz_001",
  "storage_path": "businesses/biz_001/invoices/inv_01.pdf"
}
```
- **Response Body (200 OK)**:
```json
{
  "extracted": {
    "invoice_number": "INV-2026-089",
    "date": "2026-10-15",
    "seller_gstin": "27AAACR4849R4ZI",
    "buyer_gstin": "29AABCU9603R1ZJ",
    "taxable_value": 10000.0,
    "tax_rate": 0.18,
    "tax_amount": 1800.0,
    "total": 11800.0,
    "currency": "INR"
  },
  "issues": [
    {
      "rule_code": "GSTIN_INVALID",
      "field": "seller_gstin",
      "message": "Seller GSTIN '27AAACR4849R4ZX' is invalid: Invalid check digit.",
      "severity": "High"
    }
  ],
  "risk": "High"
}
```

### `POST /invoices`
Saves the audited invoice and triggers score recompute.

### `GET /invoices?business_id=biz_001&risk=High`
Lists audited invoices.

### `PATCH /invoices/{id}/status`
Marks invoice fixed or updates notes, triggers score recompute.

---

## 3. Compliance Health Score

### `POST /score/recompute`
- **Request Body**:
```json
{
  "business_id": "biz_001"
}
```
- **Response Body (200 OK)**:
```json
{
  "healthScore": 85,
  "scoreBreakdown": [
    {
      "category": "Licences",
      "score": 30,
      "max": 40,
      "lost": 10,
      "reasons": ["Trade Licence: Expired"]
    },
    {
      "category": "Invoices",
      "score": 30,
      "max": 30,
      "lost": 0,
      "reasons": ["All recent invoices low risk"]
    }
  ],
  "penaltyExposure": 5000.0,
  "updatedAt": "2026-10-29T14:58:53Z"
}
```

---

## 4. Flags (CA Workflow)

### `POST /flags`
- **Request Body**:
```json
{
  "business_id": "biz_001",
  "itemRef": "invoices/inv_123",
  "note": "Rate on this invoice appears wrong, please review."
}
```
- **Response Body**: Created flag object with `status: "open"`.

### `GET /flags?business_id=biz_001&status=open`
Lists flags with optional status filter (`open`, `needs-info`, `resolved`).

### `POST /flags/{id}/comments`
- **Request Body**:
```json
{
  "business_id": "biz_001",
  "text": "Confirmed. Please ask the supplier for an amended credit note."
}
```

### `PATCH /flags/{id}/status`
- **Request Body**:
```json
{
  "business_id": "biz_001",
  "status": "resolved"
}
```
*(Triggers score recompute)*

---

## 5. Rules & Onboarding

### `GET /rules`
Returns full legal rules database from `rules.json`.

### `POST /businesses` (Onboarding)
- **Request Body**:
```json
{
  "name": "Shree Ganesh Retail",
  "gstin": "27AAACR4849R4ZI",
  "type": "retail",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

