# NiyamAI Data Model (Firestore)

Agreed Firestore structure per Build Specification Part 1, Section 1.4.

## Collections & Documents

### `users/{uid}`
- `role`: string (`"Owner"` | `"CA"`)
- `name`: string
- `email`: string
- `language`: string (`"en"` | `"hi"`)
- `businessIds`: array of strings

### `users/{uid}/chats/{chatId}`
- `title`: string
- `createdAt`: ISO 8601 string
- `updatedAt`: ISO 8601 string

#### Subcollection: `.../messages/{msgId}`
- `role`: string (`"user"` | `"assistant"`)
- `text`: string
- `createdAt`: ISO 8601 string

---

### `businesses/{id}`
- `name`: string
- `gstin`: string (15 characters)
- `type`: string (`"food"`, `"retail"`, `"manufacturing"`, `"services"`)
- `city`: string
- `state`: string
- `ownerUid`: string (uid of the owner)
- `caUids`: array of strings (uids of invited CAs)
- `healthScore`: number (0-100)
- `scoreBreakdown`: array of objects
- `penaltyExposure`: number (INR estimated penalty)
- `scoreUpdatedAt`: ISO 8601 string
- `createdAt`: ISO 8601 string

#### Subcollection: `businesses/{id}/licences/{id}`
- `type`: string (e.g., `"FSSAI"`, `"Trade Licence"`, `"GST"`)
- `number`: string
- `expiry`: string (`"YYYY-MM-DD"`)
- `fileUrl`: string or null
- `confidence`: number (0.0 to 1.0)
- `holder_name`: string or null
- `issue_date`: string (`"YYYY-MM-DD"`) or null
- `createdAt`: ISO 8601 string
- `createdBy`: string

*(Note: `status` is dynamically computed on fetch: `"valid"`, `"expiring"`, `"expired"`)*

#### Subcollection: `businesses/{id}/invoices/{id}`
- `extracted`: object
  - `invoice_number`: string
  - `date`: string (`"YYYY-MM-DD"`)
  - `seller_gstin`: string
  - `buyer_gstin`: string or null
  - `taxable_value`: number
  - `tax_rate`: number
  - `tax_amount`: number
  - `total`: number
  - `currency`: string (`"INR"`)
- `issues`: array of objects
  - `rule_code`: string
  - `field`: string
  - `message`: string
  - `severity`: string (`"High"` | `"Medium"` | `"Low"`)
- `risk`: string (`"Low"` | `"Medium"` | `"High"`)
- `fileUrl`: string or null
- `status`: string (`"active"` | `"fixed"` | `"flagged"`)
- `createdAt`: ISO 8601 string
- `createdBy`: string

#### Subcollection: `businesses/{id}/flags/{id}`
- `itemRef`: string (e.g. `"invoices/inv_123"` or `"licences/lic_456"`)
- `note`: string
- `status`: string (`"open"` | `"needs-info"` | `"resolved"`)
- `createdBy`: string (owner's UID)
- `createdAt`: ISO 8601 string
- `updatedAt`: ISO 8601 string

##### Subcollection: `.../flags/{id}/comments/{id}`
- `author`: string
- `authorUid`: string
- `authorRole`: string (`"Owner"` | `"CA"`)
- `text`: string
- `createdAt`: ISO 8601 string

#### Subcollection: `businesses/{id}/reminders/{id}`
- `itemRef`: string
- `daysBefore`: number
- `channel`: string (`"email"`)
- `sentAt`: ISO 8601 string
