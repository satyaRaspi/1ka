# Security Hardening Notes — v1.2.0

This build adds practical security improvements for the Karnataka Guarantee Schemes Registration Portal prototype.

## Runtime security added

- Session tokens are now generated with higher entropy and stored as SHA-256 token hashes in SQLite.
- Session expiry is enforced on every authenticated API request.
- Password hashes now use PBKDF2-SHA256 with configurable iterations. Older prototype hashes are accepted once and upgraded after successful login.
- Login and OTP endpoints are rate-limited in memory to reduce brute-force attempts.
- Request body size is limited using `MAX_BODY_BYTES`.
- Security headers are added to every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy`
  - `Content-Security-Policy`
  - Optional HSTS through `ENABLE_HSTS=1`
- API responses are marked `Cache-Control: no-store`.
- Sensitive data views now require an admin reason.
- Audit metadata redacts keys that look like Aadhaar, account, password, or token values.
- Call center application lists mask mobile numbers.
- Report exports mask mobile numbers by default.
- Public statistics small-count suppression now defaults to 5.
- Blank comments are rejected and long comments are capped.

## Recommended Railway environment variables

Set these in Railway → Service → Variables:

```text
DB_PATH=/app/data/guarantee_portal.db
DEMO_OTP=123456
PASSWORD_SALT=<generate-a-long-random-secret>
PASSWORD_ITERATIONS=210000
SESSION_TTL_HOURS=8
RATE_LIMIT_ENABLED=1
MAX_BODY_BYTES=2097152
PUBLIC_STATS_MIN_CELL_SIZE=5
CORS_ORIGINS=https://your-railway-domain.up.railway.app
ENABLE_HSTS=1
```

For local development, use:

```text
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000
ENABLE_HSTS=0
```

## Production recommendations not implemented in the prototype

Before real deployment, add:

- PostgreSQL instead of SQLite.
- Real OTP gateway with OTP expiry, resend limits, and delivery audit.
- Aadhaar Data Vault or UIDAI-compliant tokenization/reference-key architecture.
- Real PDF generation with signed audit trail.
- Centralized logging and SIEM integration.
- Periodic vulnerability scanning and dependency scanning.
- Secrets managed through Railway/Cloud secrets only.
- Department-approved privacy notice, retention policy, and grievance process.


## v1.2.5 demo-safe security fixes
- CSV/Excel formula injection protection.
- Public statistics suppression applied to all public breakdowns.
- Production guard for wildcard CORS and demo data tools.
- FastAPI docs disabled when APP_ENV=production.
- Disabled users cannot continue using existing sessions.
- Audit log hash chain added for tamper-evidence.
- Security alerts recorded for exports, sensitive views and mass proposal apply.
- Docker runtime now runs as a non-root user.
- Frontend dependencies are pinned.
- Server calculates age from DOB and performs cross-application Aadhaar duplicate checks.
