# Pamoja — Development Roadmap & Verification

## Build roadmap (what was delivered, in order)

| # | Phase | Status |
|---|-------|--------|
| 0 | Scaffold: backend (FastAPI + SQLAlchemy) and frontend (Next.js + Tailwind) | ✅ done |
| 1 | Backend core: models, schemas, JWT auth, role guards, seed data (10 companions, 11 cities) | ✅ done |
| 2 | Search API: city/gender/date/interests/languages/activity/max-rate/sort + pagination | ✅ done |
| 3 | Bookings: request → accept/decline → complete/cancel, commission 15%, payouts | ✅ done |
| 4 | Messaging: conversations, threads, unread counts, block-aware | ✅ done |
| 5 | Safety: reports, blocks, emergency contact, reviews (both sides), admin panel | ✅ done |
| 6 | Frontend: 23 pages — landing, search, profiles, auth, dashboards, chat, admin | ✅ done |
| 7 | Verification: end-to-end API flow tested; `npm run build` passes | ✅ done |

## The next 3 months (post-MVP)

**Month 1 — Monetization & trust**
1. Payments: Safaricom Daraja (M-Pesa STK push, paybill) + Stripe for international cards.
   Replace the "payment coming soon" notes; hold commission at settlement, release payouts.
2. Email: Resend transactional mail (verification, booking notifications).
3. Photo uploads via Cloudinary (free tier); profile photo required before companion approval.

**Month 2 — Scale & speed**
4. WebSockets for instant chat (replace 5-second polling).
5. ~~Search: add rating filters, saved companions/bookmarks, city autocomplete.~~ ✅ done — min-rating filter, city autocomplete (datalist), favorites/saved companions (cards + `/dashboard/saved`).
6. ~~Availability: real calendar (block out dates, time slots) + booking conflict guard.~~ ✅ light version done — start-time picker on booking, availability-window validation, overlapping-booking guard.

**Month 3 — Safety & growth**
7. AI moderation: keyword flagging on profiles/messages, image safety check.
8. ID verification: KYC via government ID upload (manual + OCR later).
9. Notifications: in-app + email digests; companion promo page (SEO landing per city).
10. Admin 2.0: analytics, dispute resolution, refund/commission ledger.

## Suggested launch sequence

1. Deploy to Vercel + Render + Neon (see DEPLOY.md), change JWT_SECRET + admin password.
2. Recruit 20–30 quality companions per city; approve them manually via `/admin`.
3. Launch with demo data replaced — wipe `pamoja.db` or use Neon with a fresh schema.
4. Soft launch: social media (Kenya WhatsApp/Facebook/Instagram presence), Nairobi + Mombasa first.
5. Measure: signups per city, booking conversion, companion response rate, report rate.
6. Then enable payments (Month 1 items) before aggressive growth.

## Known MVP trade-offs (by design)

- Messaging polls every 5s (fine for MVP; WebSockets later)
- Reviews only visible on companion profiles (traveller reviews stored; surfaced later)
- No email verification on signup yet (token flow exists; wire into Resend)
- Photos are URL-based (no upload yet); Cloudinary comes in Month 1
- Availability is weekly-slot based; date-specific calendars are Month 2