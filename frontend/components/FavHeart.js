"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";

export default function FavHeart({ companionId, className = "" }) {
  const router = useRouter();
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) return;
    let alive = true;
    api("/favorites/ids", { token: getToken() })
      .then((ids) => alive && setFaved(ids.includes(companionId)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [companionId]);

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      if (faved) {
        await api(`/favorites/${companionId}`, { method: "DELETE", token: getToken() });
        setFaved(false);
      } else {
        await api(`/favorites/${companionId}`, { method: "POST", token: getToken() });
        setFaved(true);
      }
    } catch {
      // keep previous state on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={faved ? "Remove from saved" : "Save companion"}
      className={`${className} flex items-center justify-center rounded-full backdrop-blur transition-all active:scale-90 ${
        faved
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
          : "bg-white/80 text-stone-500 hover:text-emerald-600 hover:scale-110"
      } ${loading ? "opacity-60" : ""}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill={faved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
}