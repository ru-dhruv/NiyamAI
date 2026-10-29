# Environment Variables Contract

List of environment variable names used across the NiyamAI stack (per Section 5.5).
**Never commit secrets or actual API keys.**

## Backend (FastAPI / Python)
- `PORT`: Server port (default `8000`)
- `DEV_MODE`: Set to `true` to allow test bearer tokens and bypass strict Firebase auth in dev/testing
- `USE_IN_MEMORY_DB`: Set to `true` for local in-memory Firestore storage without GCP credentials
- `FIREBASE_PROJECT_ID`: GCP Firebase Project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to service account JSON file
- `GEMINI_API_KEY`: Google Gemini API key for document extraction and chat assistant
- `EMAIL_API_KEY`: Resend / Brevo API key for reminder emails (Member C)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins for CORS

## Frontend (Next.js)
- `NEXT_PUBLIC_API_URL`: Backend URL (e.g. `http://localhost:8000`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase web client API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket

