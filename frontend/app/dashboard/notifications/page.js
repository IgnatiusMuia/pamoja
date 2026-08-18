"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashTabs from "@/components/DashTabs";
import { api } from "@/lib/api";
import { getToken, requireAuth, getUser } from "@/lib/auth";

const ICONS = {
  booking: "",
  booking_reminder: "",
  message: "",
  review: "",
  system: "",
};

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  async function load() {
    try {
      setItems(await api("/notifications?limit=100", { token: getToken() }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!requireAuth()) return;
    load();
    api("/notifications/read-all", { method: "POST", token: getToken() })
      .then(load)
      .catch(load);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={user?.role} isAdmin={user?.is_admin} />
      <h1 className="text-2xl font-extrabold mb-1">Notifications</h1>
      <p className="text-stone-500 text-sm mb-6">Booking updates, messages and reviews.</p>

      {loading ? (
        <div className="text-center py-20 text-stone-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <div className="text-5xl mb-3"></div>
          <h3 className="font-bold text-lg text-stone-700">All caught up</h3>
          <p className="text-stone-500 text-sm mt-1">You'll see booking updates and new messages here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "/dashboard"}
              className={`flex gap-3 bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all ${
                n.read_at ? "border-stone-200" : "border-emerald-300"
              }`}
            >
              <span className="text-2xl shrink-0">{ICONS[n.type] || ""}</span>
              <div className="min-w-0">
                <p className="font-bold text-sm text-stone-800">{n.title}</p>
                {n.body && <p className="text-sm text-stone-500 mt-0.5">{n.body}</p>}
                <p className="text-[11px] text-stone-400 mt-1.5">
                  {new Date(n.created_at + "Z").toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}