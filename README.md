<div align="center">

# NiyamAI · नियमAI

### Autonomous Compliance Health Score & Statutory Guidance for Indian SMBs

*AI reads and explains. Rules decide and calculate.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20NiyamAI-0d5b44?style=for-the-badge)](https://niyam-ai-five.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-Source%20Code-181717?style=for-the-badge&logo=github)](https://github.com/ru-dhruv/NiyamAI)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

</div>

---

## 📌 Overview

**NiyamAI** (Hindi: **नियमAI** — *"niyam"* means rule) is an AI-powered compliance health platform designed for Indian small and medium food businesses (pilot: Bhopal, Madhya Pradesh). 

Instead of dealing with fragmented legal portals or surprise regulatory notices, a business owner photographs an invoice or licence to instantly discover:
1. **What is wrong or expiring** (FSSAI, Fire NOC, Municipal Trade Licence, GSTIN errors).
2. **What it could cost** (statutory penalties cited with exact Act and Section).
3. **A unified Compliance Health Score (0–100)** with one-tap actions to fix issues, flag queries to their CA, or download pre-filled renewal applications.

> **Legal Disclaimer:** All automated findings, penalty calculations, and chatbot responses are indicative guidance based on publicly verified regulatory schedules. They do not constitute formal legal or tax counsel.

---

## 🚀 Key Capabilities

- **Deterministic Compliance Health Score**: Calculated from mandatory licences (50 pts), invoice audit quality (35 pts), and resolved CA advice (15 pts).
- **GST Invoice Audit Engine**: Mathematical verification of supplier GSTINs (Mod-36 checksum algorithm), tax rate calculations, and total reconciliations.
- **Licence Expiry Engine**: Dynamic status tracking (`Valid`, `Expiring Soon` ≤30 days, `Expired`) for FSSAI, Fire NOC, and Municipal Trade Licences.
- **Pre-filled Renewal PDF Generator**: Client-side vector PDF generation producing official, pre-filled renewal application drafts.
- **Rule-Grounded AI Assistant**: Chat bubble grounded strictly on official regulatory tables (`rules.json`), answering in English and Devanagari Hindi with legal citations.
- **CA Collaboration Workspace**: Seamless flagging of invoice defects to Chartered Accountants with resolution workflows (`needs-info`, `resolved`).
- **Zero-Friction Demo Mode**: 5 pre-saved licence samples and 3 invoice samples allowing instant offline auditing without external API quota consumption.

---

## 📂 Repository Structure

```text
NiyamAI/
├── frontend/             # Next.js 14 App Router, Tailwind CSS, next-intl
│   ├── app/              # Routes: dashboard, licences, invoices, ca, renewals, login
│   ├── components/       # Quarrystone UI library, shell, detail sheet, chat bubble
│   ├── lib/              # API client, auth context, PDF generator, assistant engine
│   └── messages/         # English & Hindi (Devanagari) localization dictionaries
├── backend/              # FastAPI Python backend
│   ├── routers/          # Endpoints: licences, invoices, score, flags, rules
│   ├── services/         # Deterministic GSTIN checksum & score calculation
│   └── data/             # Canonical statutory rules (rules.json)
├── docs/                 # API contract, data models, and canonical rule codes
└── tests/                # Pytest unit tests for GSTIN checksum and score logic
```

---

## ⚡ Quick Start

### 1. Frontend (Mock Mode — Zero Setup)

The frontend is configured by default to run in **Mock Mode**, requiring no backend or Firebase credentials:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- Tap **"Try demo as Owner"** to open the Business Dashboard (`/dashboard`).
- Tap **"Try demo as CA"** to open the CA Workspace (`/ca`).

### 2. Backend (Optional — Real Mode)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

To connect the frontend to the live backend, create `frontend/.env.local`:
```env
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧪 Running Tests

### Frontend (Type-Check & Lint)
```bash
cd frontend
npm run type-check
npm run lint
npm run build
```

### Backend (Pytest)
```bash
pytest tests/
```

---

<div align="center">

**NiyamAI — Making regulatory compliance transparent for Indian SMBs.**

</div>
