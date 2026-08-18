"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import DashTabs from "@/components/DashTabs";
import Avatar from "@/components/Avatar";
import { StatusBadge, STATUS_STYLES } from "@/components/BookingCard";
import { api } from "@/lib/api";
import { getToken, requireAuth, ksh } from "@/lib/auth";

function BookingDetailPage() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = async () => {
    const [u, b] = await Promise.all([api("/auth/me", { token: getToken() }), api(`/bookings/${id}`, { token: getToken() })]);
    setUser(u);
    setBooking(b);
    return b;
  };

  useEffect(() => {
    if (!requireAuth()) return;
    load().catch((e) => setError(e.message));
  }, [id]);

  async function action(path) {
    setBusy(true);
    try {
      await api(`/bookings/${id}/${path}`, { method: "POST", token: getToken() });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/bookings/reviews", {
        method: "POST",
        token: getToken(),
        body: { booking_id: Number(id), rating, comment },
      });
      setReviewed(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function checkReviewed() {
    try {
      const reviews = await api(`/companions/${booking.companion_id}/reviews`).catch(() => []);
      setReviewed(reviews.some((r) => r.reviewer_id === user.id && r.booking_id === Number(id)));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (user && booking) checkReviewed();
  }, [user, booking]);

  if (!user || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <DashTabs role={user?.role} isAdmin={user?.is_admin} />
        <p className="text-center text-stone-400">{error || "Loading booking…"}</p>
      </div>
    );
  }

  const other = user.role === "traveler" ? booking.companion : booking.traveler;
  const canAccept = user.role === "companion" && booking.status === "pending";
  const canCancel = user.role === "traveler" && ["pending", "accepted"].includes(booking.status);
  const canComplete = user.role === "companion" && booking.status === "accepted";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={user.role} isAdmin={user.is_admin} />

      <Link href="/dashboard/bookings" className="text-sm text-emerald-700 font-bold hover:underline">
        ← All bookings
      </Link>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* header */}
      <div className="mt-4 bg-white border border-stone-200 rounded-3xl shadow-sm p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar user={other} size="lg" />
            <div>
              <p className="text-sm text-stone-500">{user.role === "traveler" ? "Your companion" : "Traveller"}</p>
              <p className="text-xl font-extrabold">{other.name}</p>
              <p className="text-sm text-stone-500"> {other.city}</p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* timeline */}
        <div className="mt-6 flex items-center gap-2 text-xs font-bold">
          {["pending", "accepted", "completed"].map((s, i) => {
            const order = ["pending", "accepted", "completed"];
            const reached = order.indexOf(booking.status) >= order.indexOf(s);
            const done = order.indexOf(booking.status) > order.indexOf(s);
            return (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`h-7 w-7 rounded-full flex items-center justify-center ${
                    reached ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-400"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={reached ? "text-emerald-700" : "text-stone-400"}>{s}</span>
                {i < 2 && <span className={`h-0.5 w-8 ${reached ? "bg-emerald-500" : "bg-stone-200"}`} />}
              </div>
            );
          })}
        </div>

        {/* details */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs font-bold text-stone-400 uppercase">Activity</p>
            <p className="font-semibold mt-1"> {booking.activity}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs font-bold text-stone-400 uppercase">Date & time</p>
            <p className="font-semibold mt-1">
               {new Date(booking.booking_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {booking.start_time && <> at {booking.start_time}</>}
            </p>
            <p className="text-sm text-stone-500 mt-0.5">Duration: {booking.hours} hour{booking.hours > 1 ? "s" : ""}</p>
          </div>
        </div>

        {booking.notes && (
          <div className="mt-4 bg-stone-50 rounded-xl p-4">
            <p className="text-xs font-bold text-stone-400 uppercase">Notes</p>
            <p className="text-sm mt-1 text-stone-700">"{booking.notes}"</p>
          </div>
        )}

        {booking.status === "accepted" && (() => {
            const msg = `I'm meeting ${other.name} (${other.city}) for ${booking.activity} on ${new Date(booking.booking_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at ${booking.start_time || "an agreed time"} for ${booking.hours} hour${booking.hours > 1 ? "s" : ""}.\n\nBooking ${booking.id} · via Pamoja`;
            return (
              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 p-4">
                <p className="text-xs font-bold text-sky-700 uppercase">Share trip details</p>
                <p className="text-sm text-stone-600 mt-1">
                  Send the details below to your emergency contact so someone you trust knows where you'll be. Meet in a public place.
                </p>
                {user.emergency_name && user.emergency_phone && (
                  <p className="text-sm font-semibold text-sky-700 mt-1.5">
                    Your emergency contact: {user.emergency_name} ({user.emergency_phone})
                  </p>
                )}
                <pre className="mt-3 whitespace-pre-wrap text-sm font-sans text-stone-700">{msg}</pre>
                <button
                  onClick={async (e) => {
                    try {
                      await navigator.clipboard.writeText(msg);
                    } catch {
                      const ta = document.createElement("textarea");
                      ta.value = msg;
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand("copy");
                      ta.remove();
                    }
                    const btn = e.currentTarget;
                    btn.textContent = "Copied ✓";
                    setTimeout(() => (btn.textContent = "Copy details"), 2000);
                  }}
                  className="mt-3 bg-sky-600 text-white hover:bg-sky-700 font-bold text-sm px-4 py-2 rounded-lg"
                >
                  Copy details
                </button>
              </div>
            );
          })()}

        {/* price breakdown */}
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Payment breakdown</p>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-stone-600">{booking.hours} hr × {booking.rate_kes.toLocaleString()} KSH</span><span className="font-semibold">{booking.total_kes.toLocaleString()} KSH</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Pamoja commission (15%)</span><span className="text-stone-600">− {booking.commission_kes.toLocaleString()} KSH</span></div>
            <div className="flex justify-between border-t border-emerald-200 pt-1.5 font-bold"><span>Companion payout</span><span className="text-emerald-700">{booking.payout_kes.toLocaleString()} KSH</span></div>
          </div>
          <p className="text-xs text-stone-400 mt-2 italic"> You settle the total with your companion in person or by M-Pesa; Pamoja collects its 15% commission on completion. In-app checkout is on the roadmap.</p>
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {booking.status !== "declined" && booking.status !== "cancelled" && (
            <Link
              href={`/dashboard/messages?user=${other.id}&booking=${booking.id}`}
              className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl"
            >
              Message {other.name.split(" ")[0]}
            </Link>
          )}
          {canAccept && (
            <button onClick={() => action("accept")} disabled={busy}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl">
              ✓ Accept request
            </button>
          )}
          {canAccept && (
            <button onClick={() => action("decline")} disabled={busy}
              className="bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 font-bold px-5 py-2.5 rounded-xl">
              ✗ Decline
            </button>
          )}
          {canComplete && (
            <button onClick={() => action("complete")} disabled={busy}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl">
              ✓ Mark as completed
            </button>
          )}
          {canCancel && (
            <button onClick={() => action("cancel")} disabled={busy}
              className="bg-white border-2 border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-50 font-bold px-5 py-2.5 rounded-xl">
              Cancel booking
            </button>
          )}
        </div>
      </div>

      {/* review */}
      {booking.status === "completed" && (
        <div className="mt-8 bg-white border border-stone-200 rounded-3xl shadow-sm p-6 lg:p-8">
          <h2 className="font-extrabold text-lg mb-4">
            {reviewed ? "You reviewed this booking" : `How was your time with ${other.name.split(" ")[0]}?`}
          </h2>
          {!reviewed && (
            <form onSubmit={submitReview}>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}
                    className={`text-3xl transition-transform hover:scale-110 ${n <= rating ? "text-amber-400" : "text-stone-300"}`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share a little about your experience — respectful and honest reviews build trust."
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" disabled={busy}
                className="mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl">
                {busy ? "Submitting…" : "Submit review"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingDetailPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-stone-400">Loading booking…</div>}>
      <BookingDetailPage />
    </Suspense>
  );
}