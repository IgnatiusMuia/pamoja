"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getUser, isLoggedIn } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  function handleLogout() {
    clearSession();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const isPublicPage =
    pathname !== "/login" && pathname !== "/register" && !pathname.startsWith("/dashboard") && !pathname.startsWith("/admin");

  const links = isPublicPage
    ? [
        { href: "/search", label: "Find a Companion" },
        { href: "/activities", label: "Activities" },
        { href: "/how-it-works", label: "How It Works" },
        { href: "/become-companion", label: "Become a Companion" },
        { href: "/safety", label: "Safety" },
      ]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/bookings", label: "Bookings" },
        { href: "/dashboard/messages", label: "Messages" },
      ];

  if (user?.is_admin && !isPublicPage) {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 lg:h-[4.5rem]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-extrabold rounded-2xl px-2.5 py-1.5 text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            P
          </span>
          <span className="font-extrabold text-2xl tracking-tight text-stone-900">
            Pamoja<span className="text-gradient-warm">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? "bg-emerald-600/10 text-emerald-700"
                    : "text-stone-600 hover:text-emerald-700 hover:bg-stone-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-stone-600 hover:text-emerald-700 transition-colors"
              >
                Hi, {user.name.split(" ")[0]} 👋
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-stone-500 hover:text-red-600 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-emerald-700 hover:underline">
                Log in
              </Link>
              <Link
                href="/register"
                className="btn-primary px-5 py-2.5 text-sm shadow-lg"
              >
                Join free
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 text-stone-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-3 shadow-lg">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-semibold text-stone-700 hover:text-emerald-700">
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="text-left font-semibold text-red-600">
              Log out
            </button>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="font-semibold text-emerald-700">Log in</Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm">Join free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}