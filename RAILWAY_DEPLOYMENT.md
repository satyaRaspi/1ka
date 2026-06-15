# Railway Deployment Guide

This version is prepared for Railway as a single deployable web service. The React frontend is built during the Docker build and served by FastAPI.

## What Railway uses

- `Dockerfile` at the repository root
- `railway.json` for Dockerfile build and `/health` healthcheck
- Runtime command from Dockerfile:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Railway injects the `PORT` environment variable at runtime. Do not hardcode port `8000` in Railway.

## Recommended Railway variables

Set these in Railway → Service → Variables:

```text
DEMO_OTP=123456
PASSWORD_SALT=generate-a-long-random-secret
CORS_ORIGINS=https://your-railway-domain.up.railway.app
DB_PATH=/app/data/guarantee_portal.db
```

For better persistence, add a Railway Volume mounted at:

```text
/app/data
```

SQLite is fine for demo/prototype. For production, migrate to PostgreSQL.

## Deploy from GitHub

1. Push this folder to GitHub.
2. Open Railway.
3. Create New Project.
4. Choose Deploy from GitHub repo.
5. Select the repository.
6. Railway will detect and use the root `Dockerfile`.
7. Add the variables above.
8. Generate a public domain under Service → Settings → Networking.
9. Open `/health` to verify deployment.

## Important URLs

- App home: `/`
- Public statistics: `/public/enrollment-statistics`
- Healthcheck: `/health`
- API docs: `/docs`

## Default logins

- Admin: `admin / admin123`
- Call center: `callcenter / call123`
- Citizen OTP: `123456`

## Security variables for v1.2.0

Recommended Railway variables:

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

Use the exact Railway public domain for `CORS_ORIGINS`. Avoid `*` for private or production-like deployments.
