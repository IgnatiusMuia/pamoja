"use client";

import { useEffect, useState } from "react";
import DashTabs from "@/components/DashTabs";
import BookingCard from "@/components/BookingCard";
import { api } from "@/lib/api";
import { getToken, requireAuth } from "@/lib/auth";

export default function BookingsPage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!requireAuth()) return;
    Promise.all([api("/auth/me", { token: getToken() }), api("/bookings", { token: getToken() })])
      .then(([u, b]) => {
        setUser(u);
        setBookings(b);
      })
      .catch(console.error);
  }, []);

  if (!user) return <div className="text-center py-24 text-stone-400">Loading…</div>;

  const filters = ["all", "pending", "accepted", "completed", "declined", "cancelled"];
  const shown = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={user.role} isAdmin={user.is_admin} />
      <h1 className="text-2xl font-extrabold mb-2">Bookings</h1>
      <p className="text-stone-500 text-sm mb-6">
        {user.role === "companion" ? "Review and respond to traveller requests." : "Your companion bookings in one place."}
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${
              filter === f ? "bg-emerald-600 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-emerald-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-stone-400 py-16">No {filter !== "all" ? filter + " " : ""}bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((b) => (
            <BookingCard key={b.id} booking={b} me={user} />
          ))}
        </div>
      )}
    </div>
  );
}