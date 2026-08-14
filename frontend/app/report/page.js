"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { getToken, requireAuth } from "@/lib/auth";

const REASONS = [
  "Inappropriate or sexual messages",
  "Harassment or disrespectful behaviour",
  "Suspected scam or fraud",
  "Fake profile or identity",
  "Requesting payment outside the platform",
  "Dangerous or unsafe behaviour",
  "Other",
];

function ReportForm() {
  const searchParams = useSearchParams();
  const reportedId = Number(searchParams.get("id") || 0);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!reportedId) {
      setError("No profile selected. Go back and use the 'Report' link on a profile or conversation.");
    } else if (!requireAuth()) {
      return;
    }
  }, [reportedId]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/reports", {
        method: "POST",
        token: getToken(),
        body: { reported_id: reportedId, reason, details: details || null },
      });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-extrabold mb-2">Report received</h1>
        <p className="text-stone-500 text-sm mb-6">
          Thank you for keeping Pamoja safe. Our moderation team reviews every report.
        </p>
        <Link href="/dashboard" className="text-emerald-700 font-bold hover:underline">Back to dashboard</Link>
      </div>
    );

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-8">
        <h1 className="text-xl font-extrabold mb-1">Report a member</h1>
        <p className="text-sm text-stone-500 mb-6">Reports are confidential and reviewed within 24 hours.</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Reason *</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Choose a reason…</option>
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Details</span>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4}
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="What happened? When? Any context helps our team." />
          </label>
          <button type="submit" disabled={busy || !reportedId}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
            {busy ? "Sending…" : "Submit report"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense>
      <ReportForm />
    </Suspense>
  );
}