"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { getToken, requireAuth } from "@/lib/auth";
import { ACTIVITIES } from "@/lib/activities";

const ACTIVITY_EMOJI_MAP = Object.fromEntries(ACTIVITIES.map((a) => [a.label, a.emoji]));

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [form, setForm] = useState({ activity: "", booking_date: "", start_time: "", hours: 2, notes: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!requireAuth()) return;
    (async () => {
      try {
        const [m, c] = await Promise.all([api("/auth/me", { token: getToken() }), api(`/companions/${id}`)]);
        if (m.role !== "traveler") {
          setError("Only travellers can book companions.");
          return;
        }
        setMe(m);
        setCompanion(c);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  const total = companion ? companion.hourly_rate_kes * Number(form.hours || 0) : 0;
  const commission = Math.round(total * 0.15);
  const payout = total - commission;

  async function submit(e) {
    e.preventDefault();
    if (!form.activity || !form.booking_date) {
      setError("Choose an activity and a date.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const booking = await api("/bookings", {
        method: "POST",
        token: getToken(),
        body: {
          companion_id: Number(id),
          activity: form.activity,
          booking_date: form.booking_date,
          start_time: form.start_time || null,
          hours: Number(form.hours),
          notes: form.notes || null,
        },
      });
      router.push(`/dashboard/bookings/${booking.id}?created=1`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  if (error && !companion)
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-stone-600">{error}</p>
        <Link href="/search" className="mt-4 inline-block text-emerald-700 font-bold hover:underline">Back to search</Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href={`/companions/${id}`} className="text-sm text-emerald-700 font-bold hover:underline">← Companion profile</Link>

      <div className="mt-4 bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-sky-700 text-white px-6 lg:px-8 py-6 flex items-center gap-4">
          <Avatar user={companion} size="lg" />
          <div>
            <h1 className="text-xl font-extrabold">Request {companion?.name}</h1>
            <p className="text-emerald-100 text-sm">
              {companion?.tagline} · {companion?.hourly_rate_kes?.toLocaleString()} KSH/hour
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 lg:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-stone-700">What would you like to do together? *</span>
            <select
              value={form.activity}
              onChange={(e) => setForm({ ...form, activity: e.target.value })}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Choose an activity…</option>
              {ACTIVITIES.map((a) => (
                <option key={a.value} value={a.label}>{a.emoji} {a.label}</option>
              ))}
            </select>
          </label>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-stone-700">Date *</span>
              <input type="date" required value={form.booking_date}
                onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-stone-700">Start time</span>
              <select value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">No preference</option>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="text-[11px] text-stone-400">24h format — matching {companion?.name?.split(" ")[0]}'s availability</span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-stone-700">Number of hours *</span>
              <select value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {[1, 2, 3, 4, 5, 6, 8].map((h) => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Notes for {companion?.name?.split(" ")[0]} (optional)</span>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3} placeholder="Meeting point preferences, what you'd love to see, any questions…"
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>

          {/* live estimate */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm">
            <p className="font-bold text-emerald-800 mb-2">Estimated total</p>
            <div className="space-y-1 text-stone-600">
              <div className="flex justify-between"><span>{form.hours} hr × {companion?.hourly_rate_kes?.toLocaleString()} KSH</span><span>{total.toLocaleString()} KSH</span></div>
              <div className="flex justify-between"><span>Commission (15%)</span><span>− {commission.toLocaleString()} KSH</span></div>
              <div className="flex justify-between font-bold text-emerald-800 border-t border-emerald-200 pt-1">
                <span>You pay</span><span>{total.toLocaleString()} KSH</span>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2 italic">
              💳 Secure payment coming soon — this request confirms your agreement and rate.
            </p>
          </div>

          <button type="submit" disabled={busy || !companion}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors">
            {busy ? "Sending request…" : `Send booking request to ${companion?.name?.split(" ")[0]}`}
          </button>
          <p className="text-xs text-stone-400 text-center">
            Requests are free. The companion will accept or decline — you can chat before and after.
          </p>
        </form>
      </div>
    </div>
  );
}