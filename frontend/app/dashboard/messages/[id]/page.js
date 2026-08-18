"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashTabs from "@/components/DashTabs";
import Avatar from "@/components/Avatar";
import { API_BASE_URL, api } from "@/lib/api";
import { getToken, requireAuth } from "@/lib/auth";

const WS_BASE = API_BASE_URL.replace(/^http/, "ws");

export default function ChatPage() {
  const { id } = useParams();
  const [me, setMe] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [live, setLive] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  function replaceMessage(m) {
    setMessages((prev) => {
      if (prev.some((x) => x.id === m.id)) return prev;
      return [...prev, { ...m, created_at: m.created_at + (m.created_at.endsWith("Z") ? "" : "Z") }];
    });
  }

  async function load() {
    const data = await api(`/conversations/${id}/messages`, { token: getToken() });
    setMessages(data);
  }

  useEffect(() => {
    if (!requireAuth()) return;

    let polling = null;
    api("/auth/me", { token: getToken() })
      .then(setMe)
      .then(load)
      .catch((e) => setError(e.message));

    const token = getToken();
    if (token) {
      let ws;
      try {
        ws = new WebSocket(`${WS_BASE}/conversations/ws/${id}?token=${encodeURIComponent(token)}`);
      } catch {
        ws = null;
      }
      if (ws) {
        ws.onopen = () => {
          setLive(true);
          if (polling) {
            clearInterval(polling);
            polling = null;
          }
        };
        ws.onmessage = (ev) => {
          try {
            const m = JSON.parse(ev.data);
            if (m.id) replaceMessage(m);
          } catch {
            // ignore malformed frames
          }
        };
        ws.onclose = () => {
          setLive(false);
        };
        ws.onerror = () => {
          ws.close();
        };
        wsRef.current = ws;
      }
    }

    polling = setInterval(() => load().catch(() => {}), 5000);

    return () => {
      if (polling) clearInterval(polling);
      wsRef.current?.close();
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBody("");
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ body: text }));
      return;
    }
    try {
      await api(`/conversations/${id}/messages`, { method: "POST", token: getToken(), body: { body: text } });
      load();
    } catch (e) {
      setError(e.message);
      setBody(text);
    }
  }

  if (!me)
    return (
      <div className="text-center py-24 text-stone-400">
        <DashTabs role={me?.role} isAdmin={me?.is_admin} />
        Loading…
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <DashTabs role={me.role} isAdmin={me.is_admin} />
      <Link href="/dashboard/messages" className="text-sm text-emerald-700 font-bold hover:underline">← All conversations</Link>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="mt-4 bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[65vh]">
        <div className="border-b border-stone-200 px-5 py-4 bg-stone-50 flex items-center gap-3">
          <p className="text-sm text-stone-500">
             Remember: Pamoja is <strong>strictly platonic</strong> — keep it friendly and respectful.
          </p>
          <span className={`ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full ${
            live ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"
          }`}>
            {live ? "● Live" : "Polling…"}
          </span>
        </div>

        <div className="grow overflow-y-auto p-5 space-y-3 bg-stone-50/50">
          {messages.map((m) => {
            const mine = m.sender_id === me.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && <Avatar user={{ name: "Them" }} size="sm" className="mr-2 mt-1 shrink-0" />}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white text-stone-800 rounded-bl-sm border border-stone-200"
                }`}>
                  {m.flagged && (
                    <p className="text-[10px] font-bold mb-1 opacity-80">Auto-filtered — content not allowed on Pamoja was removed</p>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-emerald-100" : "text-stone-400"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="border-t border-stone-200 p-4 flex gap-3 bg-white">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a message…"
            className="grow rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}