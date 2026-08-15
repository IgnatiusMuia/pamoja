"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashTabs from "@/components/DashTabs";
import { api } from "@/lib/api";
import { getToken, requireAuth } from "@/lib/auth";
import { ACTIVITIES, activityEmoji } from "@/lib/activities";

const DAYS = [
  ["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"],
  ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"],
];

export default function CompanionProfilePage() {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/profile/photos/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Upload failed");
      }
      setProfile({ ...profile, photos: await res.json() });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function setPrimary(photoId) {
    try {
      const photos = await api(`/profile/photos/${photoId}/primary`, { method: "POST", token: getToken() });
      setProfile({ ...profile, photos });
    } catch (err) {
      setError(err.message);
    }
  }

  async function removePhoto(photoId) {
    try {
      const photos = await api(`/profile/photos/${photoId}`, { method: "DELETE", token: getToken() });
      setProfile({ ...profile, photos });
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (!requireAuth()) return;
    (async () => {
      const u = await api("/auth/me", { token: getToken() });
      setMe(u);
      if (u.role !== "companion") return;
      let p;
      try {
        p = await api("/me/companion", { token: getToken() });
      } catch {
        p = { tagline: "", hourly_rate_kes: 1000, description: "", activity_types: [], availability: {} };
      }
      setProfile(p);
      setForm({
        tagline: p.tagline || "",
        hourly_rate_kes: p.hourly_rate_kes || 1000,
        description: p.description || "",
        activity_types: p.activity_types || [],
        availability: { ...(p.availability || {}) },
      });
    })().catch((e) => setError(e.message));
  }, []);

  function toggleActivity(value) {
    setForm((f) => ({
      ...f,
      activity_types: f.activity_types.includes(value)
        ? f.activity_types.filter((a) => a !== value)
        : [...f.activity_types, value],
    }));
  }

  function toggleDay(key) {
    setForm((f) => {
      const availability = { ...f.availability };
      if (availability[key]) delete availability[key];
      else availability[key] = f.dayStart || "09:00";
      return { ...f, availability };
    });
  }

  function setTime(key, value) {
    setForm((f) => ({ ...f, availability: { ...f.availability, [key]: value } }));
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await api("/profile/companion", {
        method: "PUT",
        token: getToken(),
        body: {
          tagline: form.tagline,
          hourly_rate_kes: Number(form.hourly_rate_kes),
          description: form.description,
          activity_types: form.activity_types,
          availability: form.availability,
        },
      });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!me) return <div className="text-center py-24 text-stone-400">Loading…</div>;
  if (me.role !== "companion")
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-stone-600">This page is for companions.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-emerald-700 font-bold hover:underline">← Back to dashboard</Link>
      </div>
    );

  const input = "mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const completed = form.tagline && form.description && form.activity_types.length > 0 && Object.keys(form.availability).length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={me.role} isAdmin={me.is_admin} />
      <h1 className="text-2xl font-extrabold mb-1">Companion setup</h1>
      <p className="text-stone-500 text-sm mb-6">
        This is your public listing. Complete it to be approved and appear in search.
      </p>

      <form onSubmit={save} className="bg-white border border-stone-200 rounded-3xl shadow-sm p-6 lg:p-8 space-y-5">
        {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">✅ Companion profile saved.</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

        {completed && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-semibold">
            ✅ Profile complete ({100}%) — ready for review!
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Hourly rate (KSH) *</span>
            <input type="number" min="100" step="50" className={input} value={form.hourly_rate_kes}
              onChange={(e) => setForm({ ...form, hourly_rate_kes: e.target.value })} required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Tagline *</span>
            <input className={input} value={form.tagline} maxLength={80}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="e.g. Nairobi insider who knows every hidden gem" required />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Description *</span>
          <textarea className={input} rows={4} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Who are you? What would you love to show travellers?"
            required />
        </label>

        <div>
          <span className="text-sm font-semibold text-stone-700">Activities you offer *</span>
          <p className="text-xs text-stone-400 mt-0.5">Pick anything from coffee dates to safari days — you choose what you love.</p>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACTIVITIES.map((a) => (
              <button key={a.value} type="button" onClick={() => toggleActivity(a.value)}
                className={`text-left text-xs font-semibold rounded-xl border-2 px-3 py-2 transition-colors ${
                  form.activity_types.includes(a.value) ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}>
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-stone-700">Weekly availability *</span>
          <p className="text-xs text-stone-400 mt-0.5">Click days to toggle; default start time 09:00.</p>
          <div className="mt-2 space-y-2">
            {DAYS.map(([key, label]) => (
              <div key={key} className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-2.5 transition-colors ${
                form.availability[key] ? "border-emerald-600 bg-emerald-50" : "border-stone-200"
              }`}>
                <button type="button" onClick={() => toggleDay(key)} className="text-sm font-bold text-stone-700">
                  {form.availability[key] ? "✓ " : ""}{label}
                </button>
                {form.availability[key] && (
                  <div className="flex items-center gap-1 text-sm">
                    <input type="text" value={form.availability[key]} onChange={(e) => setTime(key, e.target.value)}
                      className="w-24 rounded-lg border border-stone-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    <span className="text-xs text-stone-400">e.g. 09:00-18:00</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-sm text-stone-600">
          <p className="font-bold text-stone-700 mb-3">📸 Photos</p>
          <div className="flex flex-wrap gap-3">
            {profile?.photos?.map((p) => (
              <div key={p.id} className="relative group">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${p.url}`}
                  alt="Uploaded"
                  className="h-24 w-24 object-cover rounded-xl border-2 border-white shadow ${p.is_primary ? 'border-emerald-500' : ''}"
                />
                {p.is_primary && (
                  <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">MAIN</span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5">
                  {!p.is_primary && (
                    <button type="button" onClick={() => setPrimary(p.id)}
                      className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">Set main</button>
                  )}
                  <button type="button" onClick={() => removePhoto(p.id)}
                    className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">Delete</button>
                </div>
              </div>
            ))}
            <label className="h-24 w-24 rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-stone-400">
              <span className="text-xl">+</span>
              <span className="text-[10px] font-bold">Upload</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={onUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-stone-400 mt-2">JPG, PNG or WEBP · max 5MB. Your main photo becomes your avatar.</p>
          {uploading && <p className="text-xs text-emerald-700 font-bold mt-1">Uploading…</p>}
        </div>

        <button type="submit" disabled={busy}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
          {busy ? "Saving…" : "Save companion profile"}
        </button>
      </form>
    </div>
  );
}