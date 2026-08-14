"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CompanionCard from "@/components/CompanionCard";
import { api } from "@/lib/api";
import { ACTIVITIES } from "@/lib/activities";

const CITIES = [
  "Nairobi", "Mombasa", "Diani", "Kisumu", "Nakuru", "Eldoret",
  "Nyeri", "Malindi", "Lamu", "Naivasha", "Machakos", "Thika", "Nyahururu",
];

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  q.set("sort", params.sort || "rating");
  return q.toString();
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    gender: searchParams.get("gender") || "",
    activity: searchParams.get("activity") || "",
    interests: searchParams.get("interests") || "",
    languages: searchParams.get("languages") || "",
    date: searchParams.get("date") || "",
    max_rate: searchParams.get("max_rate") || "",
    min_rating: searchParams.get("min_rating") || "",
    sort: "rating",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api(`/companions?${buildQuery(filters)}`);
      setResults(data);
    } catch (e) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  function set(k, v) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-1">Find a companion</h1>
      <p className="text-stone-500 mb-8">
        Browse for free — no account needed. Join to message and book.
      </p>

      {/* FILTERS */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">City</span>
          <input
            value={filters.city}
            onChange={(e) => set("city", e.target.value)}
            list="pamoja-cities"
            placeholder="Type a city…"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <datalist id="pamoja-cities">
            {CITIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Gender</span>
          <select
            value={filters.gender}
            onChange={(e) => set("gender", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Any</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Activity</span>
          <select
            value={filters.activity}
            onChange={(e) => set("activity", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All activities</option>
            {ACTIVITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Date needed (optional)</span>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => set("date", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Interests (comma separated)</span>
          <input
            value={filters.interests}
            onChange={(e) => set("interests", e.target.value)}
            placeholder="e.g. coffee, hiking"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Languages</span>
          <input
            value={filters.languages}
            onChange={(e) => set("languages", e.target.value)}
            placeholder="e.g. English, Swahili"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Max rate (KSH/hr)</span>
          <input
            type="number"
            min="0"
            step="100"
            value={filters.max_rate}
            onChange={(e) => set("max_rate", e.target.value)}
            placeholder="e.g. 1500"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Min rating</span>
          <select
            value={filters.min_rating}
            onChange={(e) => set("min_rating", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Any rating</option>
            <option value="4.5">4.5 ★ and up</option>
            <option value="4">4 ★ and up</option>
            <option value="3.5">3.5 ★ and up</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Sort by</span>
          <select
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="rating">Top rated</option>
            <option value="price_asc">Lowest rate</option>
            <option value="price_desc">Highest rate</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>

      {/* RESULTS */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {error} — is your backend running at http://127.0.0.1:8000?
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-stone-400">Searching companions…</div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔎</div>
          <h3 className="font-bold text-lg text-stone-700">No companions match those filters</h3>
          <p className="text-stone-500 text-sm mt-1">Try widening your search or clearing some filters.</p>
          <button
            onClick={() => {
              setFilters({ ...filters, city: "", gender: "", activity: "", interests: "", languages: "", date: "", max_rate: "", min_rating: "", sort: "rating" });
              router.replace("/search");
            }}
            className="mt-4 text-emerald-700 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-4">
            <strong className="text-stone-700">{results.length}</strong> companion
            {results.length !== 1 ? "s" : ""} found
            {filters.city ? ` in ${filters.city}` : ""}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((c) => (
              <CompanionCard key={c.id} companion={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}