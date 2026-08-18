"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Avatar from "@/components/Avatar";
import FavHeart from "@/components/FavHeart";
import Stars from "@/components/Stars";
import { api } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import { genderLabel } from "@/lib/gender";
import { activityLabel } from "@/lib/activities";

const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

function CompanionProfilePage() {
  const id = useSearchParams().get("id");
  const [companion, setCompanion] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, r] = await Promise.all([api(`/companions/${id}`), api(`/companions/${id}/reviews`)]);
        setCompanion(c);
        setReviews(r);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-center py-24 text-stone-400">Loading profile…</div>;
  if (error)
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4"></div>
        <p className="text-stone-600">{error}</p>
        <Link href="/search" className="mt-4 inline-block text-emerald-700 font-bold hover:underline">Back to search</Link>
      </div>
    );

  const c = companion;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* header card */}
      <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="h-40 bg-emerald-600 flex items-center justify-center relative">
          <FavHeart companionId={c.id} className="absolute top-4 right-4 h-10 w-10" />
          <Avatar user={c} size="lg" className="h-32 w-32 text-4xl ring-4 ring-white" />
        </div>
        <div className="p-6 lg:p-8 -mt-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-end gap-3">
              <div className="ml-[84px]">
                <h1 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-2">
                  {c.name}
                  {c.verified_id && (
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">✓ ID verified</span>
                  )}
                </h1>
                <p className="text-stone-500 mt-1"> {c.city} · {genderLabel(c.gender) || c.gender}</p>
              </div>
            </div>
            <div className="text-right">
              <Stars rating={c.rating_avg} count={c.rating_count} size="text-base" />
              <p className="mt-2 font-extrabold text-emerald-700 text-2xl">
                {c.hourly_rate_kes.toLocaleString()} KSH<span className="text-stone-400 font-normal text-base">/hour</span>
              </p>
            </div>
          </div>

          {c.tagline && <p className="mt-4 text-lg text-stone-700 font-medium italic">"{c.tagline}"</p>}
          {c.description && (
            <p className="mt-3 text-stone-600 leading-relaxed">{c.description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={isLoggedIn() ? `/book?id=${c.id}` : `/login?next=${encodeURIComponent(`/book?id=${c.id}`)}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow transition-colors"
            >
               Book {c.name.split(" ")[0]}
            </Link>
            <Link
              href={isLoggedIn() ? `/dashboard/messages?user=${c.id}` : `/login?next=/dashboard/messages?user=${c.id}`}
              className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold px-6 py-3 rounded-xl transition-colors"
            >
               Send a message
            </Link>
            <Link
              href={`/report?id=${c.id}`}
              className="ml-auto text-sm text-stone-400 hover:text-red-600 font-semibold"
            >
              Report profile
            </Link>
            <button
              onClick={async () => {
                if (!isLoggedIn()) {
                  window.location.href = "/login";
                  return;
                }
                if (confirm(`Block ${c.name}? You won't be able to message each other.`)) {
                  try {
                    await api("/blocks", { method: "POST", token: getToken(), body: { blocked_id: c.id } });
                    alert("User blocked.");
                  } catch (e) {
                    alert(e.message);
                  }
                }
              }}
              className="text-sm text-stone-400 hover:text-red-600 font-semibold"
            >
              Block
            </button>
          </div>
        </div>
      </div>

      {/* details grid */}
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Activities offered</h2>
            <div className="flex flex-wrap gap-2">
              {c.activity_types?.length > 0 ? (
                c.activity_types.map((a) => (
                  <span key={a} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold px-3 py-1.5 rounded-full">
                    {activityLabel(a)}
                  </span>
                ))
              ) : (
                <span className="text-stone-400 text-sm">Open to most social activities — just ask!</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {c.interests?.map((i) => (
                <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold px-3 py-1.5 rounded-full">
                  #{i}
                </span>
              ))}
            </div>
            <h2 className="font-bold text-lg mt-6 mb-3">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {c.languages?.map((l) => (
                <span key={l} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold px-3 py-1.5 rounded-full">
                   {l}
                </span>
              ))}
            </div>
          </div>

          {/* reviews */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-4">
              Reviews <span className="text-stone-400 font-normal">({reviews.length})</span>
            </h2>
            {reviews.length === 0 ? (
              <p className="text-stone-400 text-sm">No reviews yet — be the first to book and review!</p>
            ) : (
              <>
                <div className="flex items-start gap-6 mb-5 bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="text-center shrink-0">
                    <div className="text-4xl font-extrabold text-emerald-700">{c.rating_avg || "—"}</div>
                    <Stars rating={c.rating_avg} />
                    <p className="text-[11px] text-stone-400 mt-1">{c.rating_count} review{c.rating_count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="w-full space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const n = reviews.filter((r) => r.rating === star).length;
                      const pct = reviews.length ? Math.round((n / reviews.length) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-stone-500 font-semibold shrink-0">{star}</span>
                          <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-stone-400">{n}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-stone-700">{r.reviewer_name || "Verified member"}</span>
                        <Stars rating={r.rating} />
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-stone-600 leading-relaxed">{r.comment}</p>}
                      <p className="mt-1 text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Weekly availability</h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DAY_LABELS).map(([key, label]) => {
                const slot = c.availability?.[key];
                return (
                  <div
                    key={key}
                    className={`rounded-lg px-2 py-2 text-center text-xs font-semibold border ${
                      slot
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-stone-50 text-stone-300 border-stone-100"
                    }`}
                  >
                    <span className="block">{label}</span>
                    <span className="block mt-0.5">{slot || "—"}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-stone-400">Times are flexible — message to arrange.</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h2 className="font-bold text-lg text-emerald-800 mb-2">How booking works</h2>
            <ol className="text-sm text-emerald-900/80 space-y-2 list-decimal list-inside">
              <li>Send a booking request with your date & activity</li>
              <li>Chat to agree details and confirm the rate</li>
              <li>{c.name.split(" ")[0]} accepts and you meet in a public place</li>
              <li>Rate each other after your time together — totally platonic, always</li>
            </ol>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-sm">
            <h2 className="font-bold mb-2"> Photos</h2>
            {c.photos?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {c.photos.map((p) => (
                  <img key={p.id} src={p.url} alt="Companion" className="rounded-lg h-28 w-full object-cover" />
                ))}
              </div>
            ) : (
              <p className="text-stone-400">Photos coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanionProfilePageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-stone-400">Loading profile…</div>}>
      <CompanionProfilePage />
    </Suspense>
  );
}