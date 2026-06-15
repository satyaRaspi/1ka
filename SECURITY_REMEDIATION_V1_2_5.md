# Karnataka Guarantee Portal v1.2.5 - Demo-Safe Security Remediation

This build hardens the v1.2.4 tested build while preserving the requested demo constraints:

- SQLite remains in use for demo/local/Railway prototype operation.
- Demo authentication remains unchanged: default admin/call-center users and fixed citizen OTP remain available.
- No external API-dependent controls were added.

## Fixed / Improved Controls

1. CORS production guard: `CORS_ORIGINS=*` is blocked when `APP_ENV=production`.
2. FastAPI docs/OpenAPI are disabled when `APP_ENV=production`.
3. Disabled admin/call-center users can no longer keep using old sessions.
4. Demo-data generation and clear tools are blocked in production unless explicitly enabled.
5. CSV/Excel/text exports are protected against spreadsheet formula injection.
6. Public statistics suppression now applies to scheme, district, status, gender and trend breakdowns.
7. Public statistics filters are applied consistently across charts and breakdowns.
8. Docker runtime now runs as a non-root user.
9. Frontend dependency versions are pinned instead of using `latest`.
10. Server calculates age from DOB instead of trusting client-submitted age.
11. Cross-application Aadhaar duplicate checks were added for applicant and family-member data.
12. Audit logs now include a hash-chain style `prev_hash` and `entry_hash` for tamper evidence.
13. Security alerts are recorded for exports, sensitive-data views and approval proposal apply events.
14. Sensitive-data access requires a meaningful reason of at least 15 characters.
15. Reports now capture a purpose field in the audit trail.
16. Privacy-request and grievance update endpoints were added.
17. A demo-safe retention review endpoint logs retention-review actions without deleting data.
18. Production HSTS can be auto-enabled when `APP_ENV=production`.
19. Export masking helper masks Aadhaar, bank account and mobile fields before report output.
20. Request model limits were added for comments, privacy requests, grievances and approval apply reasons.

## Intentionally Not Changed

These were intentionally preserved as requested for demo use:

- SQLite database platform.
- Default admin and call-center users.
- Fixed demo OTP flow.
- Authentication architecture and localStorage token model.
- MFA/SMS/eKYC/API-provider dependent controls.

## Recommended Railway Variables for Hardened Demo

```text
APP_ENV=demo
DB_PATH=/app/data/guarantee_portal.db
DEMO_OTP=123456
PASSWORD_SALT=<long-random-demo-secret>
PASSWORD_ITERATIONS=210000
SESSION_TTL_HOURS=8
RATE_LIMIT_ENABLED=1
MAX_BODY_BYTES=2097152
PUBLIC_STATS_MIN_CELL_SIZE=5
CORS_ORIGINS=https://your-railway-domain.up.railway.app
ENABLE_HSTS=1
ENABLE_DEMO_TOOLS=1
```

For production-like demos, set `APP_ENV=production` only after confirming exact `CORS_ORIGINS` and whether demo tools should be explicitly enabled.
