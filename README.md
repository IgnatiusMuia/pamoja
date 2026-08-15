# Pamoja — Kenya's Platonic Travel Companion Platform

Find friendly, vetted locals to explore Kenya with — sightseeing, dining, museums, coffee, city
adventures. **Strictly platonic. Purely social.** Modelled on RentAFriend.com.

## Tech stack

| Layer    | Choice                                                        |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router, JavaScript) + Tailwind CSS v4         |
| Backend  | FastAPI (Python 3.11+) + SQLAlchemy 2 + Pydantic v2           |
| Database | SQLite for local dev → PostgreSQL (Neon) in production        |
| Auth     | JWT (access + refresh tokens), bcrypt password hashing        |
| Payments | Stubbed (commission math built-in at 15%) — M-Pesa/Stripe next |

## Project layout

```
Pamoja/
├── backend/                 # FastAPI API
│   ├── app/
│   │   ├── main.py          # app + CORS + routers
│   │   ├── config.py        # env settings (.env)
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py        # users, profiles, bookings, messages, reviews…
│   │   ├── schemas.py       # Pydantic request/response models
│   │   ├── security.py      # JWT + bcrypt + role guards
│   │   ├── seed.py          # demo data (10 companions, 11 cities)
│   │   └── routers/         # auth, companions, bookings, messaging,
│   │                        # safety (reports/blocks/emergency), admin
│   ├── requirements.txt
│   └── .env.example
└── frontend/                # Next.js app
    ├── app/                 # 25 routes (public + dashboard + admin)
    ├── components/          # Navbar, Footer, cards, stars, avatar, tabs
    └── lib/                 # api.js client, auth.js token helpers
```

## Run it locally

### 1. Backend (port 8000)

```bash
cd backend
/opt/homebrew/bin/python3.14 -m venv .venv        # or python3.11+
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/uvicorn app.main:app --reload --port 8000
```

API docs (interactive): http://127.0.0.1:8000/docs — health check: http://127.0.0.1:8000/health

The DB (`pamoja.db`) is created and seeded automatically on first start.

### 2. Frontend (port 3000)

```bash
cd frontend
npm install
cp .env.local.example .env.local    # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

Open http://localhost:3000

### Demo accounts

| Role      | Email                   | Password     |
| --------- | ----------------------- | ------------ |
| Traveller | demo@pamoja.ke          | password123  |
| Companion | wanjiru.kamau@pamoja.ke | password123  |
| Admin     | admin@pamoja.ke         | admin123     |

## Feature checklist (MVP)

- [x] Registration & login (traveller / companion roles), JWT auth
- [x] Free search with filters: city (autocomplete), gender, date, interests, languages, activity (45+ types), min rating, max rate, sort
- [x] Saved companions — heart to save anywhere, manage list on the dashboard
- [x] Activities showcase page (/activities) — Kenya-adapted catalogue with descriptions
- [x] Public companion profiles: bio, interests, languages, availability, reviews, hourly rate (KSH)
- [x] Booking flow: request → accept / decline → completed / cancelled, time-slot conflict guard
- [x] Transparent pricing: rate × hours, 15% commission, companion payout shown
- [x] In-app messaging (all conversations on-platform; block-aware, WebSocket live chat)
- [x] Two-way reviews after completed bookings
- [x] Safety: report, block/unblock, emergency contact, manual companion approval, admin panel
- [x] Companion setup: own rate, activities, weekly availability
- [x] Photo uploads (local storage, set-primary/delete, avatar sync) + keyword moderation (chat + profiles, auto-reports)
- [ ] Payments (M-Pesa Daraja / Stripe) — interface designed, ready to plug in
- [ ] Cloudinary uploads, email (Resend), AI-powered moderation

## Tests / verification

Automated API suite (94 tests — auth, companions & search, bookings, favorites, messaging +
WebSocket chat, moderation, notifications, photos, safety, admin; 98% coverage):

```bash
cd backend
.venv/bin/python -m pytest        # green: 94 passed
.venv/bin/python -m pytest --cov=app   # coverage report (98%)
```

CI runs the pytest suite on every push/PR (`.github/workflows/ci.yml`), then boots the API and
runs the end-to-end smoke test.

End-to-end smoke test (needs the live stack — `./start.sh`):

```bash
FRONTEND=http://localhost:3000 python3 scripts/smoke.py   # 20 checks, exit 0 = green
node scripts/client-token-flow.mjs                        # token refresh/retry logic (real frontend lib)
```

Covers: health, registration, search, booking → accept → complete → review, messaging,
block/unblock, reports, admin — plus client-side access-token refresh (401 → refresh → retry,
logout on failure).

Quick manual smoke check (book → accept → message → complete → review → report → admin):

```bash
cd backend
curl -X POST http://127.0.0.1:8000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"demo@pamoja.ke","password":"password123"}'
```

Then use the returned `access_token` with `Authorization: Bearer <token>`.
Full walkthrough: see `docs/ROADMAP.md` (step 6) or the API docs at `/docs`.

## Deployment

See `docs/DEPLOY.md` for the step-by-step go-live guide (Vercel + Render + Neon).