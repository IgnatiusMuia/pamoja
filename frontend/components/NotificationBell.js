"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

const ICONS = {
  booking: "",
  message: "",
  review: "",
  system: "",
};

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!getUser()) return;
    let alive = true;
    async function poll() {
      try {
        const data = await api("/notifications?limit=8", { token: getToken() });
        if (alive) setItems(data);
      } catch {
        // ignore
      }
    }
    poll();
    const t = setInterval(poll, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const unread = items.filter((n) => !n.read_at).length;

  async function markAllRead(e) {
    e.preventDefault();
    e.stopPropagation();
    await api("/notifications/read-all", { method: "POST", token: getToken() }).catch(() => {});
    setItems(items.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  }

  if (!getUser()) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
      >
        <svg className="h-6 w-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-5 h-5 px-1 bg-red-600 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <p className="font-extrabold text-sm">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-bold text-emerald-700 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="text-sm text-stone-400 text-center py-10">Nothing yet — it's quiet in here.</p>
            )}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/dashboard"}
                onClick={() => setOpen(false)}
                className={`block px-5 py-3 hover:bg-stone-50 border-b border-stone-50 last:border-0 ${
                  n.read_at ? "opacity-60" : "bg-emerald-50/40"
                }`}
              >
                <p className="text-sm font-bold text-stone-800">
                  {ICONS[n.type] || ""} {n.title}
                </p>
                {n.body && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.body}</p>}
                <p className="text-[10px] text-stone-400 mt-1">
                  {new Date(n.created_at + "Z").toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-sm font-bold text-emerald-700 py-3 hover:bg-emerald-50 border-t border-stone-100"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}