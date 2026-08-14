"use client";

import { useEffect, useState } from "react";
import DashTabs from "@/components/DashTabs";
import { api } from "@/lib/api";
import { getToken, requireAuth } from "@/lib/auth";

export default function AdminPage() {
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [companions, setCompanions] = useState([]);
  const [reports, setReports] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tab, setTab] = useState("companions");
  const [statusFilter, setStatusFilter] = useState("pending");

  async function refresh() {
    const [s, c, r, f, a] = await Promise.all([
      api("/admin/stats", { token: getToken() }),
      api("/admin/companions?status=" + statusFilter, { token: getToken() }),
      api("/admin/reports?status=open", { token: getToken() }),
      api("/admin/flagged-messages", { token: getToken() }),
      api("/admin/analytics", { token: getToken() }).catch(() => null),
    ]);
    setStats(s);
    setCompanions(c);
    setReports(r);
    setFlagged(f);
    setAnalytics(a);
  }

  useEffect(() => {
    if (!requireAuth()) return;
    api("/auth/me", { token: getToken() })
      .then((u) => {
        setMe(u);
        if (!u.is_admin) window.location.href = "/dashboard";
        refresh();
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (me?.is_admin) refresh();
  }, [statusFilter]);

  async function act(path) {
    await api(path, { method: "POST", token: getToken() });
    refresh();
  }

  if (!me) return <div className="text-center py-24 text-stone-400">Loading…</div>;

  const statCards = stats
    ? [
        ["Travellers", stats.travelers, "text-emerald-600"],
        ["Companions", stats.companions, "text-sky-600"],
        ["Pending approvals", stats.pending_approvals, "text-amber-500"],
        ["Open reports", stats.open_reports, "text-red-600"],
        ["Total bookings", stats.bookings, "text-orange-500"],
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={me.role} isAdmin={me.is_admin} />
      <h1 className="text-2xl font-extrabold mb-1">Admin panel</h1>
      <p className="text-stone-500 text-sm mb-6">Moderation: approvals, reports and member management.</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {statCards.map(([label, value, color]) => (
          <div key={label} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase">{label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("companions")}
          className={`px-5 py-2 rounded-full text-sm font-bold ${tab === "companions" ? "bg-emerald-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
          Companion approvals
        </button>
        <button onClick={() => setTab("reports")}
          className={`px-5 py-2 rounded-full text-sm font-bold ${tab === "reports" ? "bg-red-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
          Reports {stats?.open_reports > 0 ? `(${stats.open_reports})` : ""}
        </button>
        <button onClick={() => setTab("flagged")}
          className={`px-5 py-2 rounded-full text-sm font-bold ${tab === "flagged" ? "bg-amber-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
          Auto-filtered messages {flagged.length > 0 ? `(${flagged.length})` : ""}
        </button>
        <button onClick={() => setTab("analytics")}
          className={`px-5 py-2 rounded-full text-sm font-bold ${tab === "analytics" ? "bg-sky-600 text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
          Analytics
        </button>
      </div>

      {tab === "companions" && (
        <div>
          <div className="flex gap-2 mb-4">
            {["pending", "approved", "suspended", "rejected", "all"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold capitalize ${statusFilter === s ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {companions.length === 0 && <p className="text-stone-400 text-center py-8">None here.</p>}
            {companions.map((c) => (
              <div key={c.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
                <div className="min-w-0 grow">
                  <p className="font-bold">{c.name} <span className="text-stone-400 font-normal">· {c.email}</span></p>
                  <p className="text-sm text-stone-500">
                    📍 {c.city || "—"} · {c.rate ? c.rate.toLocaleString() + " KSH/hr" : "no rate"} · joined {new Date(c.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs mt-1">
                    {c.is_approved ? (
                      <span className="text-emerald-600 font-bold">✓ approved</span>
                    ) : (
                      <span className="text-amber-600 font-bold">⏳ pending</span>
                    )}
                    {" · "}
                    <span className={c.status === "suspended" ? "text-red-600 font-bold" : "text-stone-400"}>{c.status}</span>
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!c.is_approved && c.status === "active" && (
                    <button onClick={() => act(`/admin/companions/${c.id}/approve`)} className="bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-emerald-700">
                      ✓ Approve
                    </button>
                  )}
                  {c.status === "active" && (
                    <>
                      <button onClick={() => act(`/admin/companions/${c.id}/reject`)} className="bg-white border border-red-300 text-red-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-red-50">
                        ✗ Reject
                      </button>
                      <button onClick={() => act(`/admin/users/${c.id}/suspend`)} className="bg-white border border-stone-300 text-stone-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-stone-50">
                        Suspend
                      </button>
                    </>
                  )}
                  {c.status === "suspended" && (
                    <button onClick={() => act(`/admin/users/${c.id}/unsuspend`)} className="bg-sky-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-sky-700">
                      Unsuspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 && (
            <p className="text-stone-400 text-center py-8">🎉 No open reports. The community is behaving!</p>
          )}
          {reports.map((r) => (
            <div key={r.id} className="bg-white border border-red-200 rounded-2xl p-4 shadow-sm">
              <p className="font-bold text-sm">
                ⚠️ {r.reporter_name} reported {r.reported_name}
                <span className="text-stone-400 font-normal"> · {new Date(r.created_at).toLocaleString()}</span>
              </p>
              <p className="text-sm text-stone-600 mt-1"><strong>Reason:</strong> {r.reason}</p>
              {r.details && <p className="text-sm text-stone-500 mt-1">"{r.details}"</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => act(`/admin/users/${r.reported_id}/suspend`)} className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-red-700">
                  Suspend {r.reported_name}
                </button>
                <button onClick={() => act(`/admin/reports/${r.id}/resolve`)} className="bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-emerald-700">
                  Resolve
                </button>
                <button onClick={() => act(`/admin/reports/${r.id}/dismiss`)} className="bg-white border border-stone-300 text-stone-600 text-sm font-bold px-4 py-2 rounded-lg hover:bg-stone-50">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "flagged" && (
        <div className="space-y-3">
          {flagged.length === 0 && (
            <p className="text-stone-400 text-center py-8">🛡️ No auto-filtered messages. Community guidelines holding strong.</p>
          )}
          {flagged.map((m) => (
            <div key={m.id} className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
              <p className="font-bold text-sm">
                🤖 {m.sender_name}
                <span className="text-stone-400 font-normal"> → to {m.conversation_partner} · {new Date(m.created_at).toLocaleString()}</span>
              </p>
              <p className="text-sm text-stone-600 mt-1 bg-stone-50 rounded-lg px-3 py-2">"{m.body}"</p>
              <p className="text-xs text-stone-400 mt-2">Original content removed automatically — an open report was filed on behalf of the sender.</p>
            </div>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-6">
          {!analytics ? (
            <p className="text-stone-400 text-center py-8">Analytics unavailable.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  ["Completed bookings", analytics.revenue.bookings, "text-emerald-600"],
                  ["Commission earned", analytics.revenue.commission_kes.toLocaleString() + " KSH", "text-orange-600"],
                  ["Paid out to companions", analytics.revenue.payouts_kes.toLocaleString() + " KSH", "text-sky-600"],
                  ["Avg companion rating", "★ " + analytics.avg_rating, "text-amber-500"],
                ].map(([label, value, color]) => (
                  <div key={label} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-stone-400 uppercase">{label}</p>
                    <p className={`text-xl font-extrabold mt-1 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4">Bookings by status</h3>
                  <div className="space-y-2.5">
                    {Object.entries(analytics.bookings_by_status).map(([status, count]) => {
                      const max = Math.max(1, ...Object.values(analytics.bookings_by_status));
                      return (
                        <div key={status} className="flex items-center gap-3 text-sm">
                          <span className="w-24 capitalize text-stone-500 font-semibold">{status}</span>
                          <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${status === "completed" ? "bg-emerald-500" : status === "accepted" ? "bg-sky-500" : status === "pending" ? "bg-amber-400" : "bg-stone-300"}`}
                              style={{ width: `${(count / max) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4">Top companions by commission (KSH)</h3>
                  {analytics.top_companions.length === 0 ? (
                    <p className="text-stone-400 text-sm">No completed bookings yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.top_companions.map((tc, i) => (
                        <div key={tc.name} className="flex items-center gap-3 text-sm">
                          <span className="font-extrabold text-stone-400 w-6">{i + 1}.</span>
                          <span className="font-semibold grow">{tc.name}</span>
                          <span className="text-stone-400">{tc.bookings} booking{tc.bookings !== 1 ? "s" : ""}</span>
                          <span className="font-bold text-emerald-700">{tc.commission_kes.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4">Signups — last 14 days</h3>
                  <div className="flex items-end gap-1.5 h-28">
                    {analytics.signups_by_day.map((d) => {
                      const max = Math.max(1, ...analytics.signups_by_day.map((x) => x.count));
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-stone-500">{d.count > 0 ? d.count : ""}</span>
                          <div className={`w-full rounded-t ${d.count > 0 ? "bg-gradient-to-t from-emerald-600 to-teal-400" : "bg-stone-100"}`}
                            style={{ height: `${(d.count / max) * 100}%` }} />
                          <span className="text-[9px] text-stone-400">{new Date(d.date).getDate()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4">Companions by city</h3>
                  <div className="space-y-2.5">
                    {analytics.companions_by_city.map((c) => {
                      const max = Math.max(1, ...analytics.companions_by_city.map((x) => x.count));
                      return (
                        <div key={c.city} className="flex items-center gap-3 text-sm">
                          <span className="w-24 font-semibold text-stone-600">{c.city}</span>
                          <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${(c.count / max) * 100}%` }} />
                          </div>
                          <span className="w-8 text-right font-bold">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}