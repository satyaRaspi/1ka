# Karnataka Guarantee Schemes Registration Portal v1.2.5

A full-stack working prototype for the Government of Karnataka 5 Guarantee Schemes registration portal.

## Features included

- Citizen login with mobile number + demo OTP `123456`
- Admin login with `admin / admin123`
- Call center login with `callcenter / call123`
- Citizen registration workflow
  - Privacy notice
  - Applicant details
  - Present address
  - Immediate family members
  - Scheme selection
  - Review and register
- Aadhaar and bank masking in list/detail views
- Admin dashboard with analytics
- Admin application search and status workflow
- Revised enrollment workflow: Draft → Registered → batch Aadhaar verification → Under Review → scheme-wise eligibility/approval
- Citizen-facing Status & Eligibility page
- Admin batch Aadhaar verification action
- Admin Approval Proposal Scan with proposal-first, apply-later approval workflow
- Rule-based approval proposal analytics for Gruha Lakshmi, Gruha Jyothi, Anna Bhagya and Yuva Nidhi
- Monthly electricity usage reference table with mass CSV upload for Gruha Jyothi approval checks
- Ration card BPL/APL reference table with mass CSV upload for Anna Bhagya approval checks
- Admin scheme-wise eligibility and approval update controls
- Admin reports with JSON, CSV, dependency-free Excel (.xlsx) and text/PDF-style export
- Call center view-only module with comments
- Modern public enrollment statistics URL with large KPI ribbon, modern hero section, charts, filters, and privacy note
- DPDPA-readiness modules
  - Privacy requests
  - Grievances
  - Compliance dashboard
  - Sensitive data access logs
  - Retention policy seed data
  - Data field registry seed data
- Responsive mobile and desktop UI

## Project structure

```text
karnataka_guarantee_portal/
  backend/
    main.py
    requirements.txt
    .env.example
  frontend/
    package.json
    index.html
    src/
      main.jsx
      styles.css
  run_backend.bat
  run_frontend.bat
  run_backend.sh
  run_frontend.sh
```

## Backend setup

Open a terminal:

```bash
cd backend
python -m venv .venv
```

Activate environment:

Windows:

```bash
.venv\Scripts\activate
```

Mac/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend API will run at:

```text
http://localhost:8000
```

API docs:

```text
http://localhost:8000/docs
```

## Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```


## Workflow added in v1.2.5

1. Citizen completes the form and clicks **Register Application**.
2. Application status becomes **Registered**.
3. Admin runs **Batch Aadhaar Verification** from Application Management.
4. Registered applications move to **Under Review**.
5. Admin opens an application and updates each selected scheme with eligibility and approval status.
6. Citizen opens **View Status & Eligibility** to see the current application status, Aadhaar batch verification status, and scheme-wise eligibility/approval.


## Approval Proposal Scan added in v1.2.5

The admin module includes **Approval Proposal Scan**.

1. Admin uploads or maintains monthly electricity usage records. CSV columns: `consumer_no,usage_month,units`.
2. Admin uploads or maintains ration card records. CSV columns: `ration_card_no,card_type,household_size`.
3. Admin clicks **Run Approval Proposal Scan**.
4. The system generates a proposal and analytics, but does not apply approvals yet.
5. Admin reviews scheme-wise proposed decisions and reasons.
6. Admin clicks **Apply Proposal** to update scheme eligibility and approval statuses.

Rules implemented:

- Gruha Lakshmi: only one female is proposed for approval per same-address family group; the eldest female is selected.
- Gruha Jyothi: latest monthly electricity usage must be less than 200 units.
- Anna Bhagya: ration card must be marked BPL in the reference table.
- Yuva Nidhi: graduate/diploma qualification is checked from entered applicant, family or scheme data.
- Shakti Scheme: female resident indicator is checked from applicant/family gender details.

## Default credentials

### Admin

```text
Username: admin
Password: admin123
```

### Call Center

```text
Username: callcenter
Password: call123
```

### Citizen

```text
Mobile: any 10-digit number, e.g. 9876543210
OTP: 123456
```

## Public statistics URL

```text
http://localhost:5173/public/enrollment-statistics
```

## Important prototype notes

- This is a prototype and not a production system.
- Real Aadhaar verification/eKYC integration is not enabled.
- Aadhaar Data Vault integration is not implemented; the requirement is represented as production-readiness guidance.
- OTP is simulated using fixed demo OTP `123456`.
- PDF export is implemented as a lightweight text-based export in this prototype. It can be upgraded to ReportLab or WeasyPrint for production-grade PDF.
- Excel export is dependency-free in v1.2.0, so `openpyxl` is no longer required.
- SQLite is used for local prototype persistence.
- Increase public-statistics small-count suppression threshold before production deployment.

## Railway deployment note

For Railway, set the backend start command as:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

On Windows local command prompt, use a fixed port:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```



## v1.2.0 Update
- Gender fields are dropdowns.
- Date of Birth uses date picker.
- Age is auto-calculated from DOB and read-only.
- Mobile and Aadhaar inputs are numeric-only with length validation.
- Email validates for @ symbol.
- Marital status is a dropdown.
- District and State are dropdowns, with State defaulting to Karnataka.


## Railway Deployment

This package is Railway-ready as a single deployable service. Railway will use the root `Dockerfile` to build the React frontend and run the FastAPI backend. The backend serves the built frontend, so only one Railway service is required.

Files added for Railway:

- `Dockerfile`
- `railway.json`
- `.dockerignore`
- `Procfile` fallback
- `RAILWAY_DEPLOYMENT.md`

Recommended Railway variables:

```text
DEMO_OTP=123456
PASSWORD_SALT=generate-a-long-random-secret
CORS_ORIGINS=https://your-railway-domain.up.railway.app
DB_PATH=/app/data/guarantee_portal.db
```

For SQLite persistence, create a Railway Volume and mount it at `/app/data`.

Railway healthcheck path:

```text
/health
```

The app must listen on the Railway-provided `$PORT`; this build does that through the Dockerfile command.


Note: `frontend/package-lock.json` is intentionally not included in the Railway-ready package so Railway installs frontend packages from the public npm registry instead of using a local/generated lockfile.

## v1.2.0 Update

- Cleaned and realigned the main login page.
- Kannada remains the default language on the main login page.
- English toggle is visible before login.
- Mobile layout now shows the login card first, followed by portal information.
- Role buttons stack cleanly on small mobile screens.
- Login form fields and buttons are touch-friendly for mobile phones.
- Frontend build and backend compile checks passed.


## v1.2.0 Update

- Citizen applications are editable only in Draft or Returned for Correction status.
- Citizen login can view submitted/registered/under-review/approved/rejected applications in a read-only application view.
- Dashboard messaging clearly explains when editing is locked and when it becomes available again.
- Backend edit APIs continue to enforce the same status rule.


## v1.2.0 Update

All dashboard/statistic/report tiles are now clickable. Admin dashboard tiles navigate to relevant application, report, or compliance records; report tiles open previews; citizen tiles open application/status details; public statistics tiles focus related aggregate details while preserving privacy.

## Security hardening added in v1.2.0

- Hashed session-token storage instead of raw token storage.
- Enforced session expiry on every protected API call.
- PBKDF2-SHA256 password hashing with backward-compatible upgrade for old prototype hashes.
- Rate limiting for admin login, call center login, OTP request, and OTP verification.
- Safer CORS defaults for local development and Railway single-domain deployment.
- Security headers including CSP, frame protection, referrer policy, permissions policy, and no-sniff.
- Optional HSTS through `ENABLE_HSTS=1`.
- API no-store cache headers.
- Body-size limit through `MAX_BODY_BYTES`.
- Sensitive data view now requires an admin reason.
- Audit metadata redaction for Aadhaar/account/password/token-like keys.
- Call center list view masks mobile numbers.
- Report exports mask mobile numbers by default.
- Public statistics small-count suppression defaults to 5.

See `SECURITY_HARDENING.md` for Railway variables and production hardening notes.

## v1.2.5 Update — Mass Test Demo Data

Admin now has a **Demo Data** module for creating mass test data with varied use cases.

Features:

- Generate 25 to 500 demo applications in one click
- Option to clear existing demo data before generation
- Option to generate linked electricity usage and ration card reference data
- Creates varied cases for approval proposal testing:
  - Same-address duplicate family groups
  - Eldest-female Gruha Lakshmi approval cases
  - Gruha Jyothi below 200 units approval cases
  - Gruha Jyothi 200+ units rejection cases
  - Anna Bhagya BPL approval cases
  - Anna Bhagya APL rejection cases
  - Yuva Nidhi graduate approval cases
  - Yuva Nidhi non-graduate rejection cases
  - Missing reference data / on-hold cases
  - Multi-scheme mixed eligibility cases
- Demo data can be generated first, then **Approval Proposal Scan** can be run to show rule-based approval analytics.

API endpoints added:

- `POST /api/admin/demo-data/generate`
- `GET /api/admin/demo-data/summary`
- `DELETE /api/admin/demo-data`

## v1.2.5 Update — SQLite Demo Data Lock Fix

This build fixes local Windows/Mac `sqlite3.OperationalError: database is locked` errors that could occur while generating large demo datasets.

Changes:
- SQLite connections now use a 30-second timeout and `PRAGMA busy_timeout`.
- SQLite WAL mode is enabled for better local read/write concurrency.
- Mass demo data generation is serialized with an application lock.
- Demo generation and demo clear operations now use explicit transactions with rollback and guaranteed connection close.
- If another demo generation is already running, the API returns a friendly 409 response instead of leaving the database locked.

If a previous run already produced a lock, stop the backend terminal with `Ctrl+C` and restart it before running demo generation again.
