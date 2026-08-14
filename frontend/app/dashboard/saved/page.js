"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashTabs from "@/components/DashTabs";
import Avatar from "@/components/Avatar";
import Stars from "@/components/Stars";
import { api } from "@/lib/api";
import { getToken, requireAuth, getUser } from "@/lib/auth";

export default function SavedPage() {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    if (!requireAuth()) return;
    api("/favorites", { token: getToken() })
      .then(setFavs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function remove(id) {
    api(`/favorites/${id}`, { method: "DELETE", token: getToken() })
      .then(() => setFavs(favs.filter((f) => f.id !== id)))
      .catch(console.error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={user?.role} isAdmin={user?.is_admin} />
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Saved companions</h1>
          <p className="text-stone-500 text-sm mt-1">
            Companions you've hearted while browsing — tap the heart anywhere to save or remove.
          </p>
        </div>
        <Link href="/search" className="text-emerald-700 font-bold text-sm hover:underline">
          Browse more →
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400">Loading…</div>
      ) : favs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
          <div className="text-5xl mb-3">🤍</div>
          <h3 className="font-bold text-lg text-stone-700">Nothing saved yet</h3>
          <p className="text-stone-500 text-sm mt-1 mb-5">Heart a companion to keep them here.</p>
          <Link href="/search" className="btn-primary px-6 py-3 text-sm">
            Find companions
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favs.map((c) => (
            <div key={c.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all border border-stone-200/80 overflow-hidden flex flex-col">
              <div className={`relative h-36 bg-gradient-to-br ${
                c.gender === "female" ? "from-amber-100 via-orange-50 to-rose-100" : c.gender === "male" ? "from-teal-100 via-emerald-50 to-sky-100" : "from-violet-100 via-fuchsia-50 to-amber-100"
              } flex items-center justify-center`}>
                <span className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_70%_20%,rgba(251,191,36,0.25),transparent_60%)]" />
                <Avatar user={c} size="lg" className="h-20 w-20 text-2xl ring-4 ring-white shadow-lg" />
              </div>
              <div className="p-4 flex flex-col gap-1 grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-stone-900">{c.name}</h3>
                    <p className="text-sm text-stone-500">📍 {c.city}</p>
                  </div>
                  <Stars rating={c.rating_avg} count={c.rating_count} />
                </div>
                <p className="text-sm text-stone-600 line-clamp-2">{c.tagline || c.description}</p>
                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                  <Link href={`/companions/${c.id}`} className="text-sm font-bold text-emerald-700 hover:underline">
                    View profile →
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-700 text-sm">{c.hourly_rate_kes.toLocaleString()} KSH/hr</span>
                    <button
                      onClick={() => remove(c.id)}
                      className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}