"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      setSession(data);

      if (data.user.is_admin) {
        window.location.href = "/admin";
      } else if (data.user.role === "companion" && !data.user.is_approved) {
        setShowDemo(true);
        window.location.href = "/dashboard";
      } else {
        window.location.href = searchParams.get("next") || "/dashboard";
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showDemo && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-xl px-4 py-3 text-sm">
          Your companion profile is pending approval by our team. Meanwhile, you can set up your profile.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="••••••••"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>

      <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-xs text-stone-600 space-y-1">
        <p className="font-bold text-stone-700">Demo accounts (run the backend first):</p>
        <p>Traveler: <code className="bg-white px-1 rounded">demo@pamoja.ke</code> / <code>password123</code></p>
        <p>Companion: <code className="bg-white px-1 rounded">wanjiru.kamau@pamoja.ke</code> / <code>password123</code></p>
        <p>Admin: <code className="bg-white px-1 rounded">admin@pamoja.ke</code> / <code>admin123</code></p>
        <button
          type="button"
          onClick={() => {
            setEmail("demo@pamoja.ke");
            setPassword("password123");
          }}
          className="text-emerald-700 font-bold hover:underline"
        >
          Fill demo traveler →
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-8">
        <h1 className="text-2xl font-extrabold text-center">Welcome back</h1>
        <p className="text-stone-500 text-sm text-center mt-1 mb-6">Log in to message, book and explore.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-stone-500">
          New here?{" "}
          <Link href="/register" className="text-emerald-700 font-bold hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  );
}