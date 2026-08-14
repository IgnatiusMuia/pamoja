"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashTabs({ role, isAdmin }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/dashboard/saved", label: "Saved" },
    { href: "/dashboard/notifications", label: "Notifications" },
    { href: "/dashboard/profile", label: "My Profile" },
    ...(role === "companion" ? [{ href: "/dashboard/companion-profile", label: "Companion Setup" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 mb-8">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            pathname === t.href
              ? "bg-emerald-600 text-white"
              : "bg-white text-stone-600 border border-stone-200 hover:border-emerald-400"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}