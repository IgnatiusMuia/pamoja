"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashTabs from "@/components/DashTabs";
import { api } from "@/lib/api";
import { getToken, requireAuth, ksh } from "@/lib/auth";

export default function BillingPage() {
  const [me, setMe] = useState(null);
  const [billing, setBilling] = useState(null);
  const [phone, setPhone] = useState("07");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (!requireAuth()) return;
    api("/auth/me", { token: getToken() })
      .then(setMe)
      .catch(() => {});
    api("/billing/me", { token: getToken() })
      .then(setBilling)
      .catch((e) => setError(e.message));
  }, []);

  async function pay(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setReceipt(null);
    try {
      const p = await api("/billing/mpesa/stk-push", {
        method: "POST",
        token: getToken(),
        body: { phone },
      });
      setReceipt(p);
      const b = await api("/billing/me", { token: getToken() });
      setBilling(b);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!me) return <div className="text-center py-24 text-stone-400">Loading…</div>;

  const active = billing?.listing_active;
  const expiring =
    billing?.paid_until &&
    new Date(billing.paid_until + "Z") - new Date() < 3 * 24 * 60 * 60 * 1000;
  const commissions = (billing?.payments || []).filter((p) => p.method === "commission");
  const dueTotal = commissions
    .filter((p) => p.status === "due")
    .reduce((s, p) => s + p.amount_kes, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={me.role} isAdmin={me.is_admin} />
      <h1 className="text-2xl font-extrabold mb-1">Billing</h1>
      <p className="text-stone-500 text-sm mb-6">
        Keep your companion listing live with a small monthly fee — travellers search and book
        you while your listing is active.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      {receipt && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
          <strong>Payment received (test mode).</strong> Receipt {receipt.reference} · {ksh(receipt.amount_kes)} · {new Date(receipt.created_at).toLocaleString()}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-3xl shadow-sm p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase">Monthly listing fee</p>
            <p className="text-3xl font-extrabold text-emerald-700 mt-1">{ksh(billing?.listing_fee_kes || 300)}<span className="text-base text-stone-400 font-bold">/month</span></p>
            <p className="text-sm text-stone-500 mt-1">
              One month of live listing, renewable any time. 15% commission applies on completed bookings.
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-stone-100 text-stone-500 border-stone-200"
          }`}>
            {active ? "Listing live" : "Listing inactive"}
          </span>
        </div>

        {billing?.paid_until && (
          <p className={`mt-4 text-sm rounded-xl px-4 py-3 ${
            expiring ? "bg-amber-50 text-amber-800 border border-amber-200"
                     : "bg-stone-50 text-stone-600"
          }`}>
            Listing active until <strong>{new Date(billing.paid_until + "Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>.
            {billing.last_payment && (
              <> Last payment: {billing.last_payment.reference} · {ksh(billing.last_payment.amount_kes)}.</>
            )}
            {expiring && (
              <> Renew soon to stay live in search.</>
            )}
          </p>
        )}

        <form onSubmit={pay} className="mt-6 rounded-2xl bg-stone-50 border border-stone-200 p-5">
          <p className="font-bold text-stone-800 mb-1">Pay with M-Pesa (test mode)</p>
          <p className="text-xs text-stone-500 mb-3">
            This is a sandbox checkout — no real money moves and payment confirms instantly.
          </p>
          <div className="flex flex-wrap gap-3">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="M-Pesa number e.g. 0712345678"
              className="grow min-w-52 rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" disabled={busy}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              {busy ? "Processing…" : `Pay ${ksh(billing?.listing_fee_kes || 300)}`}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-sm text-stone-500 space-y-1">
        <p>· While your listing is active, you appear in search and can be booked by travellers.</p>
        <p>· If it lapses, your profile is paused in search until you renew.</p>
        <p>
          · Questions? See our <Link href="/pricing" className="text-emerald-700 font-bold hover:underline">pricing</Link> page.
        </p>
      </div>

      {billing?.payments?.length > 0 && (
        <div className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <h2 className="font-extrabold text-lg">Payment history</h2>
            <div className="flex gap-2 text-xs font-bold">
              <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                Commission due: {ksh(dueTotal)}
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">
                {commissions.filter((p) => p.status === "paid").length} commissions settled
              </span>
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm divide-y divide-stone-100">
            {billing.payments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
                <div className="min-w-0 grow">
                  <p className="font-bold capitalize">{p.method === "commission" ? "Commission (share of booking)" : `Listing fee (${p.method.toUpperCase()})`}</p>
                  <p className="text-xs text-stone-400">
                    {p.reference} · {new Date(p.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  p.status === "paid" ? "bg-emerald-50 text-emerald-700"
                  : p.status === "due" ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-500"
                }`}>
                  {p.status === "due" ? "Due — settle with Pamoja" : p.status}
                </span>
                <span className="font-bold">{ksh(p.amount_kes)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}