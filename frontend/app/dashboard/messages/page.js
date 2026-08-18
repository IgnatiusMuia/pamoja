"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DashTabs from "@/components/DashTabs";
import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { getToken, requireAuth } from "@/lib/auth";

function MessageList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [me, setMe] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requireAuth()) return;
    api("/auth/me", { token: getToken() })
      .then(setMe)
      .then(() => loadConversations())
      .catch(console.error);
  }, []);

  async function loadConversations() {
    const data = await api("/conversations", { token: getToken() });
    setConversations(data);
    setLoading(false);
  }

  // start conversation with a user from ?user=INT
  const startWith = Number(searchParams.get("user") || 0);
  const bookingId = Number(searchParams.get("booking") || 0);
  useEffect(() => {
    if (!me || !startWith) return;
    if (conversations.find((c) => c.other_user.id === startWith)) {
      router.push(`/dashboard/messages/view?id=${conversations.find((c) => c.other_user.id === startWith).id}`);
      return;
    }
    api("/conversations", {
      method: "POST",
      token: getToken(),
      body: { user_b_id: startWith, booking_id: bookingId || null },
    })
      .then((c) => router.push(`/dashboard/messages/view?id=${c.id}`))
      .catch((e) => alert(e.message));
  }, [me, startWith]);

  if (!me) return <div className="text-center py-24 text-stone-400">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={me.role} isAdmin={me.is_admin} />
      <h1 className="text-2xl font-extrabold mb-1">Messages</h1>
      <p className="text-stone-500 text-sm mb-6">Keep conversations on the platform — your contact details stay private.</p>

      {loading ? (
        <p className="text-center text-stone-400 py-16">Loading conversations…</p>
      ) : conversations.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-2xl">
          <p className="font-bold text-stone-700 mb-1">No conversations yet</p>
          <p className="text-sm text-stone-500">
            Message a companion from their profile, or after sending a booking request.
          </p>
          <Link href="/search" className="mt-4 inline-block text-emerald-700 font-bold hover:underline">
            Find a companion →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <Link key={c.id} href={`/dashboard/messages/view?id=${c.id}`}
              className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
              <Avatar user={c.other_user} />
              <div className="min-w-0 grow">
                <p className="font-bold text-stone-800">{c.other_user.name}</p>
                <p className="text-sm text-stone-500 truncate">
                  {c.last_message ? c.last_message.body : "Say hello "}
                </p>
              </div>
              <div className="text-right shrink-0">
                {c.unread_count > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{c.unread_count}</span>
                )}
                <p className="text-xs text-stone-400 mt-1">
                  {c.last_message ? new Date(c.last_message.created_at).toLocaleDateString() : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesPage() {
  return (
    <Suspense>
      <MessageList />
    </Suspense>
  );
}

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={null}>
      <MessagesPage />
    </Suspense>
  );
}
