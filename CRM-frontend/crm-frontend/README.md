# Rklogix CRM — Frontend

A complete React + Vite + Tailwind frontend for your Express/MongoDB/Redis CRM
backend, with dark/light ("black & white") theming, page transitions, an
animated Kanban deal board, and a personal profile page.

## What's included

- **Login / Register** — JWT auth, auto access-token refresh on 401.
- **Dashboard** — stats, charts (leads by status, deals by stage), recent leads. Shows whether data came from the Redis cache.
- **Leads** — searchable/filterable table, create/edit, delete (admin), assign to a team member (admin).
- **Lead detail** — full profile, activity timeline (log calls/emails/notes), linked deals & follow-ups.
- **Deals** — drag-and-drop Kanban board across all 5 stages.
- **Follow-ups** — pending/completed tasks, overdue highlighting, mark complete.
- **Audit log** (admin only) — every write action, who did it, when.
- **Profile** — edit name/phone/bio, upload an avatar photo, change password.
- **Theme toggle** — animated black/white (dark/light) switch, persisted.

## 1. Backend changes (already applied for you)

Your uploaded backend didn't have a way to list users (needed for the
"assign lead" dropdown) or to update your own profile, so these were added:

- `GET  /api/auth/users` — list active users (name, email, role, avatar).
- `PATCH /api/auth/me` — update your own name/phone/bio/avatar.
- `POST /api/auth/change-password` — change your password.
- `User` model gained `phone`, `bio`, `avatar` fields.
- JSON body limit raised from 10kb → 2mb (so an avatar photo can be uploaded).

Everything else in the backend is untouched. Reinstall backend deps and run
it as usual:

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT secrets, etc.
npm run dev
```

## 2. Running the frontend

```bash
npm install
cp .env.example .env
# edit .env: VITE_API_URL should point at your backend, e.g.
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## 3. Notes

- Deals aren't filterable by lead on the backend, so the lead-detail page
  fetches deals and filters them on the client. Fine for normal data sizes;
  if your deal count grows very large, add a `lead` filter to
  `dealService.getDeals` on the backend.
- The register screen lets you pick a role (admin/sales) since the backend
  API allows it — you may want to remove that in production and assign
  roles manually instead.
- Avatars are stored as base64 data URLs directly on the user document —
  simple and works out of the box, but keep photos small (the uploader
  blocks anything over 1.5MB).
