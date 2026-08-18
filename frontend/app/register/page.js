"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { GENDER_OPTIONS } from "@/lib/gender";
import { INTEREST_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/options";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "companion" ? "companion" : "traveler";

  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ name: "", email: "", password: "", gender: "", city: "Nairobi" });
  const [interests, setInterests] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [over18, setOver18] = useState(false);

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: { ...form, role, interests, languages, over_18: over18 },
      });
      setSession(data);
      window.location.href = role === "companion" ? "/dashboard" : "/search";
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          ["traveler", "Traveller", "Find companions to explore Kenya"],
          ["companion", "Companion", "Show travellers your city & earn"],
        ].map(([value, label, desc]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`rounded-2xl border-2 p-4 text-left transition-all ${
              role === value
                ? "border-emerald-600 bg-emerald-50 shadow-sm"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <span className="font-bold block">{label}</span>
            <span className="text-xs text-stone-500">{desc}</span>
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Full name</span>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. Kevin Otieno" />
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Email</span>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Password (8+ chars)</span>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="••••••••" />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">City (home base)</span>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Nairobi" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Gender</span>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">Prefer not to say</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <span className="text-sm font-semibold text-stone-700">Interests</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((i) => (
            <button key={i} type="button" onClick={() => toggle(interests, setInterests, i)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                interests.includes(i) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-600 border-stone-300 hover:border-emerald-400"
              }`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-semibold text-stone-700">Languages you speak</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((l) => (
            <button key={l} type="button" onClick={() => toggle(languages, setLanguages, l)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                languages.includes(l) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-600 border-stone-300 hover:border-emerald-400"
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        <input type="checkbox" required checked={over18} onChange={(e) => setOver18(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-emerald-600" />
        <span className="text-sm text-emerald-900">
          <strong>I confirm I am 18 years or older.</strong> Pamoja is strictly for adults — members
          under 18 are not allowed on the platform, and we verify every companion profile before
          approval.
        </span>
      </label>

      <p className="text-xs text-stone-500">
        By joining you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/guidelines" className="underline">Community Guidelines</Link>, including that Pamoja is
        strictly platonic — no dating, romance or adult services.
      </p>

      <button type="submit" disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
        {loading ? "Creating account…" : role === "companion" ? "Create companion account — free" : "Create account — free"}
      </button>
    </form>
  );
}

function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-8">
        <h1 className="text-2xl font-extrabold text-center">Join Pamoja</h1>
        <p className="text-stone-500 text-sm text-center mt-1 mb-6">
          A friend you can trust in every town. One account, two ways to use the platform.
        </p>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-700 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
