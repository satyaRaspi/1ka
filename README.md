# Karnataka Guarantee Schemes Registration Portal v1.1.2

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


## Workflow added in v1.1.2

1. Citizen completes the form and clicks **Register Application**.
2. Application status becomes **Registered**.
3. Admin runs **Batch Aadhaar Verification** from Application Management.
4. Registered applications move to **Under Review**.
5. Admin opens an application and updates each selected scheme with eligibility and approval status.
6. Citizen opens **View Status & Eligibility** to see the current application status, Aadhaar batch verification status, and scheme-wise eligibility/approval.

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
- Excel export is dependency-free in v1.1.2, so `openpyxl` is no longer required.
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



## v1.1.2 Update
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
PASSWORD_SALT=change-this-in-railway
CORS_ORIGINS=*
DB_PATH=/app/data/guarantee_portal.db
```

For SQLite persistence, create a Railway Volume and mount it at `/app/data`.

Railway healthcheck path:

```text
/health
```

The app must listen on the Railway-provided `$PORT`; this build does that through the Dockerfile command.


Note: `frontend/package-lock.json` is intentionally not included in the Railway-ready package so Railway installs frontend packages from the public npm registry instead of using a local/generated lockfile.
