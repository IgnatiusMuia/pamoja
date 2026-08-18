"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashTabs from "@/components/DashTabs";
import BookingCard from "@/components/BookingCard";
import { api } from "@/lib/api";
import { getToken, requireAuth, ksh } from "@/lib/auth";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  declined: "bg-red-100 text-red-800",
  cancelled: "bg-stone-200 text-stone-600",
  completed: "bg-emerald-100 text-emerald-800",
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [companionProfile, setCompanionProfile] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requireAuth()) return;
    (async () => {
      try {
        const [u, b] = await Promise.all([
          api("/auth/me", { token: getToken() }),
          api("/bookings", { token: getToken() }),
        ]);
        setUser(u);
        setBookings(b);
        if (u.role === "companion") {
          api("/me/companion", { token: getToken() })
            .then(setCompanionProfile)
            .catch(() => {});
          api("/billing/me", { token: getToken() })
            .then(setBilling)
            .catch(() => {});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading && !user) return <div className="text-center py-24 text-stone-400">Loading…</div>;
  if (!user) return null;

  const incoming = bookings.filter((b) => b.status === "pending" && user.role === "companion");
  const completed = bookings.filter((b) => b.status === "completed");
  const earnings = completed.reduce((sum, b) => sum + b.payout_kes, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={user.role} isAdmin={user.is_admin} />

      <div className="bg-emerald-900 text-white rounded-3xl p-8 lg:p-10 mb-8">
        {user.role === "traveler" ? (
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold">
                Welcome, {user.name.split(" ")[0]}
              </h1>
              <p className="text-emerald-100 mt-1">
                Find a vetted local companion and start planning your next hangout.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/search" className="inline-block bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-6 py-3 rounded-xl transition-colors">
                  Find a companion
                </Link>
                <Link href="/activities" className="inline-block bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                  Browse activities
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold">
                Welcome, {user.name.split(" ")[0]}
              </h1>
              <p className="text-emerald-100 mt-1">
                Companion dashboard — manage your availability and bookings.
              </p>
              {!user.is_approved && (
                <div className="mt-4 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-emerald-50">
                  Your companion profile is <strong>pending approval</strong>. Our team reviews profiles to
                  keep the community safe — you will appear in search as soon as you are approved.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase">Total bookings</p>
          <p className="text-3xl font-extrabold text-stone-900 mt-1">{bookings.length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase">Completed</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{completed.length}</p>
        </div>
        {user.role === "companion" ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase">Earnings (after Pamoja's fee)</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-2">{ksh(earnings)}</p>
            {(() => {
              const due = (billing?.payments || [])
                .filter((p) => p.method === "commission" && p.status === "due")
                .reduce((s, p) => s + p.amount_kes, 0);
              return due > 0 ? (
                <p className="text-xs font-bold text-amber-600 mt-1">{ksh(due)} commission due — settle with Pamoja</p>
              ) : null;
            })()}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase">Spent</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{ksh(completed.reduce((s, b) => s + b.total_kes, 0))}</p>
          </div>
        )}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase">Pending</p>
          <p className="text-3xl font-extrabold text-amber-500 mt-1">{incoming.length}</p>
        </div>
      </div>

      {/* billing nudge */}
      {user.role === "companion" && billing && !billing.listing_active && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-stone-800">Your listing is paused</p>
            <p className="text-sm text-stone-600">
              Travellers can't find you in search until you activate your listing with the monthly fee.
            </p>
          </div>
          <Link href="/dashboard/billing" className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
            Activate listing
          </Link>
        </div>
      )}

      {/* companion setup nudge */}
      {user.role === "companion" && companionProfile && (companionProfile.activity_types?.length === 0 || !companionProfile.tagline) && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-emerald-800">Complete your companion profile to get booked</p>
            <p className="text-sm text-emerald-700/80">
              {companionProfile.activity_types?.length === 0
                ? "Add your activity types and availability."
                : "Add a tagline to stand out in search."}
            </p>
          </div>
          <Link href="/dashboard/companion-profile" className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
            Set up now
          </Link>
        </div>
      )}

      {/* incoming requests for companions */}
      {user.role === "companion" && incoming.length > 0 && (
        <div className="mb-8">
          <h2 className="font-extrabold text-lg mb-3">New booking requests</h2>
          <div className="space-y-4">
            {incoming.map((b) => (
              <BookingCard key={b.id} booking={b} me={user} />
            ))}
          </div>
        </div>
      )}

      {/* recent bookings */}
      <h2 className="font-extrabold text-lg mb-3">
        {user.role === "companion" ? "Your calendar" : "Your travel plans"}
      </h2>
      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
          <p className="font-bold text-stone-700 mb-1">No bookings yet</p>
          <p className="text-sm text-stone-500 mb-5">
            {user.role === "traveler" ? "Browse companions and start planning your next adventure." : "Complete your profile setup to receive booking requests."}
          </p>
          {user.role === "traveler" ? (
            <Link href="/search" className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors">
              Find a companion
            </Link>
          ) : (
            <Link href="/dashboard/companion-profile" className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors">
              Setup companion profile
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.slice(0, 5).map((b) => (
            <BookingCard key={b.id} booking={b} me={user} />
          ))}
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/messages" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-colors">
          <p className="font-bold">Messages</p>
          <p className="text-sm text-stone-500 mt-1">Chat with companions and travellers.</p>
        </Link>
        <Link href="/dashboard/profile" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-colors">
          <p className="font-bold">Profile & safety</p>
          <p className="text-sm text-stone-500 mt-1">Update your info and emergency contact.</p>
        </Link>
      </div>
    </div>
  );
}