# Week 3 — Dashboard + Security + Performance — Progress Tracker

- [x] GET /dashboard/stats
- [x] Redis cache for dashboard (cache-aside, TTL-based, auto-invalidated on lead/deal/followup writes; degrades gracefully if REDIS_URL is unset)
- [x] Rate limiter + Helmet + CORS
- [x] DB indexes (email, phone, assignedTo, stage)
- [x] Audit log APIs

# Week 4 — Testing + Deploy — Progress Tracker

- [x] TASK 1 — Unit Tests (Jest)
  - [x] authService.test.js
  - [x] leadService.test.js
  - [x] dealService.test.js
  - [x] integration/leads.test.js
- [x] TASK 2 — Postman Collection
- [x] TASK 3 — Deployment Setup (Procfile, .env.example, DEPLOY.md)
- [x] TASK 4 — Sentry Integration (fixed for @sentry/node v8+ API)
