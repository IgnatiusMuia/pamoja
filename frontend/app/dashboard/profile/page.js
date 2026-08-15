"use client";

import { useEffect, useState } from "react";
import DashTabs from "@/components/DashTabs";
import { api } from "@/lib/api";
import { getToken, requireAuth, setUser } from "@/lib/auth";

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!requireAuth()) return;
    api("/auth/me", { token: getToken() })
      .then((u) => {
        setMe(u);
        setForm({
          name: u.name,
          gender: u.gender || "",
          city: u.city || "",
          bio: u.bio || "",
          interests: (u.interests || []).join(", "),
          languages: (u.languages || []).join(", "),
          phone: u.phone || "",
          emergency_name: u.emergency_name || "",
          emergency_phone: u.emergency_phone || "",
        });
      })
      .catch(console.error);
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await api("/auth/me", {
        method: "PUT",
        token: getToken(),
        body: {
          ...form,
          interests: form.interests ? form.interests.split(",").map((s) => s.trim()).filter(Boolean) : [],
          languages: form.languages ? form.languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
        },
      });
      setUser(updated);
      setMe(updated);
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!me) return <div className="text-center py-24 text-stone-400">Loading…</div>;

  const input = "mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={me.role} isAdmin={me.is_admin} />
      <h1 className="text-2xl font-extrabold mb-1">My profile</h1>
      <p className="text-stone-500 text-sm mb-6">Your details, privacy and emergency contact.</p>

      <form onSubmit={save} className="bg-white border border-stone-200 rounded-3xl shadow-sm p-6 lg:p-8 space-y-4">
        {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">✅ Profile saved.</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Full name</span>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Gender</span>
            <select className={input} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">City</span>
            <input className={input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Nairobi" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-stone-700">About you</span>
          <textarea className={input} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="A few friendly lines about yourself…" />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Interests (comma separated)</span>
            <input className={input} value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="coffee, hiking, art" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Languages</span>
            <input className={input} value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="English, Swahili" />
          </label>
        </div>

        <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
          <h2 className="font-bold text-orange-800 mb-1">🚨 Emergency contact</h2>
          <p className="text-xs text-orange-700 mb-3">
            Kept private and never shown to other members. Shared with you or emergency services in case of concern.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-stone-700">Contact name</span>
              <input className={input} value={form.emergency_name} onChange={(e) => setForm({ ...form, emergency_name: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-stone-700">Contact phone</span>
              <input className={input} value={form.emergency_phone} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} placeholder="+254 7XX XXX XXX" />
            </label>
          </div>
        </div>

        <button type="submit" disabled={busy}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}