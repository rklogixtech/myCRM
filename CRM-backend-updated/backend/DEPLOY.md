# Deployment Guide — CRM Backend

This guide covers deploying the CRM Backend (Node.js + Express + MongoDB) to production.

---

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas cluster (or any MongoDB instance)
- Git
- (Optional) Redis instance for dashboard caching
- (Optional) Sentry DSN for error tracking

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Set to `production` in production |
| `DATABASE_URL` | MongoDB connection string (see Atlas format below) |
| `JWT_SECRET` | Strong random string for access tokens |
| `JWT_REFRESH_SECRET` | Strong random string for refresh tokens |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Sentry Data Source Name for error tracking |
| `JWT_EXPIRES_IN` | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: 7d) |
| `REDIS_URL` | Redis connection string for dashboard stats caching (e.g. from Render/Upstash/Railway). If unset, the API works normally but always reads dashboard stats directly from MongoDB. |
| `DASHBOARD_CACHE_TTL` | Dashboard cache TTL in seconds (default: 60) |

---

## MongoDB Atlas Connection String Format

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Replace:
- `<username>` — database user
- `<password>` — database user password (URL-encode special chars)
- `<dbname>` — database name (e.g., `crm`)

---

## Production Checklist

- [ ] `NODE_ENV` set to `production`
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong, unique random values (use `openssl rand -hex 32`)
- [ ] CORS origin is restricted — update `cors()` in `src/app.js` to allow only your frontend domain:
      ```js
      app.use(cors({ origin: 'https://your-frontend-domain.com' }));
      ```
- [ ] MongoDB Atlas IP Whitelist is configured (allow 0.0.0.0/0 for public API, or restrict to Render's IPs)
- [ ] Health check endpoint `/api/health` is used by your uptime monitoring service
- [ ] Rate limiting is enabled (already configured with `express-rate-limit`)
- [ ] Helmet security headers are active (already configured)
- [ ] Application logs are being collected (Winston configured for production with file transports)
- [ ] Sentry DSN is set (if using error tracking)
- [ ] `REDIS_URL` is set for dashboard caching (optional — app degrades gracefully to direct DB reads if omitted)

---

## Deploying to Render

### Option A: Using the Procfile

1. Push code to a GitHub/GitLab repository
2. On Render Dashboard → New → Web Service
3. Connect your repository
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (as defined in Procfile)
5. Add all required environment variables in Render dashboard
6. Deploy

### Option B: Using render.yaml (Infrastructure as Code)

A `render.yaml` can be added for reproducible deployments. See Render docs for details.

---

## Uptime Monitoring

Use the `/api/health` endpoint for health checks:

```
GET /api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-03-02T12:00:00.000Z"
}
```

Configure your monitoring service (e.g., UptimeRobot, Better Uptime, Pingdom) to hit this endpoint every 5 minutes.

---

## Post-Deployment Verification

1. Hit `GET /api/health` — should return 200
2. Register a user via `POST /api/auth/register`
3. Login via `POST /api/auth/login`
4. Perform CRUD operations on leads, deals, followups
5. Check Sentry dashboard for any captured errors (if configured)

