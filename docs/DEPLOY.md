# Deployment Guide — Pamoja (go live in ~1 hour)

Stack to deploy: **Vercel** (frontend, free) + **Render** (API, ~$7/mo) + **Neon** (PostgreSQL, free).
Total cost from launch: **US$0–7/month**. You'll need a free account at each and a domain if you want one.

---

## Step 1 — Database: Neon (free Postgres)

1. Sign up at https://neon.tech (or use Supabase free tier).
2. Create a project; copy the **connection string** — it looks like:
   `postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/pamoja?sslmode=require`
3. Keep it handy — you'll paste it into Render.

---

## Step 2 — Backend: Render

1. Push the repo to GitHub (create repo, then):
   ```bash
   git init && git add -A && git commit -m "Pamoja MVP"
   ```
2. On https://render.com → **New → Web Service** → connect your GitHub repo.
3. Settings:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
   - **Instance type:** Free (then upgrade to Starter $7/mo when live users appear)
4. **Environment variables**:
   ```
   DATABASE_URL=<neon connection string>
   JWT_SECRET=<long random string — generate at https://randomkeygen.com>
   CORS_ORIGINS=https://yourdomain.vercel.app,http://localhost:3000
   ADMIN_EMAIL=you@yourcompany.co.ke
   ADMIN_PASSWORD=<strong admin password>
   ```
5. Deploy. Note the URL: e.g. `https://pamoja-api.onrender.com`
6. Verify: open `https://pamoja-api.onrender.com/health` → `{"status":"ok"...}`.
   The database tables and seed data are created automatically on first boot.
   ⚠️ **Delete the seed data before real launch** — see "Launch checklist" below.

---

## Step 3 — Frontend: Vercel

1. On https://vercel.com → **Add New → Project** → import the same GitHub repo.
2. Settings:
   - **Root directory:** `frontend`
   - **Framework:** Next.js (auto-detected)
3. **Environment variable:**
   ```
   NEXT_PUBLIC_API_URL=https://pamoja-api.onrender.com
   ```
4. Deploy. You get `https://pamoja-frontend-xxx.vercel.app` →
   **Custom Domains** tab to add `pamoja.co.ke` (set the DNS record Vercel shows you).

---

## Step 4 — Launch checklist (do these BEFORE inviting users)

1. **Wipe demo data:** connect to Neon (psql / Neon's SQL editor) and run:
   ```sql
   DELETE FROM messages; DELETE FROM reviews; DELETE FROM bookings;
   DELETE FROM blocks; DELETE FROM reports; DELETE FROM conversations;
   DELETE FROM users;
   ```
   (Keep the schema — new companions register from the live site.)
2. Create your own admin account from the app's admin panel — log in as `admin@pamoja.ke`
   and **change the admin password** via your Neon SQL editor:
   copy a bcrypt hash from a user you registered, then run `UPDATE users SET password_hash='...' WHERE email='admin@pamoja.ke';`
3. Environment `JWT_SECRET` — verify it's a long random string, not the default.
4. Test payments-free flow on the live URLs: register traveller → search → book → chat → accept → review.
5. Switch the site to maintainance-grade moderation from day one: approve every companion
   manually via `/admin` before they appear in search.

---

## Step 5 — Keeping it running

| Task | Frequency |
|---|---|
| Review pending companion approvals | Daily (first weeks) |
| Review open reports | Daily |
| Check logs: Render dashboard → Logs | Weekly |
| `JWT_SECRET` rotation | If suspected leak |
| Backups: Neon free tier auto-backs-ups; enable a daily export | Monthly check |

---

## Step 6 — When you add payments (Month 1)

- M-Pesa: Safaricom **Daraja API** — register a company + paybill/Till. Server-to-server STK push,
  callback URL on Render. See `docs/M-PESA.md` when implemented.
- Stripe: create account (works internationally; Kenya payouts supported), add keys to Render env.
- Both plug into the existing `total_kes / commission_kes / payout_kes` booking fields — no schema change needed.

---

## Cost summary (launch month)

| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby | $0 |
| Neon | Free tier (0.5 GB) | $0 |
| Render | Free → Starter | $0 → $7/mo |
| Domain | pamoja.co.ke | ~KSH 1,500/yr |
| **Total** | | **$7 max** |