import Link from "next/link";
import Avatar from "./Avatar";
import Stars from "./Stars";
import { activityEmoji } from "@/lib/activities";

export default function CompanionCard({ companion }) {
  const gradient =
    companion.gender === "female"
      ? "from-amber-100 via-orange-50 to-rose-100"
      : companion.gender === "male"
      ? "from-teal-100 via-emerald-50 to-sky-100"
      : "from-violet-100 via-fuchsia-50 to-amber-100";

  return (
    <Link
      href={`/companions/${companion.id}`}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-stone-200/80 overflow-hidden flex flex-col hover:border-emerald-300"
    >
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center p-4`}>
        <span className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_70%_20%,rgba(251,191,36,0.25),transparent_60%)]" />
        <Avatar user={companion} size="lg" className="h-24 w-24 text-3xl ring-4 ring-white shadow-xl" />
        {companion.verified_id && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            ✓ Verified
          </span>
        )}
        {companion.is_featured && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            ★ Featured
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col gap-1.5 grow">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors">
              {companion.name}
            </h3>
            <p className="text-sm text-stone-500">📍 {companion.city}</p>
          </div>
          <Stars rating={companion.rating_avg} count={companion.rating_count} />
        </div>
        <p className="text-sm text-stone-600 line-clamp-2">{companion.tagline || companion.description}</p>
        {companion.activity_types?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {companion.activity_types.slice(0, 3).map((a) => (
              <span key={a} className="bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {activityEmoji(a)} {a.replace(/_/g, " ")}
              </span>
            ))}
            {companion.activity_types.length > 3 && (
              <span className="text-[11px] text-stone-400 font-semibold self-center">+{companion.activity_types.length - 3}</span>
            )}
          </div>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-extrabold text-emerald-700">
            {companion.hourly_rate_kes.toLocaleString()} KSH
            <span className="text-stone-400 font-medium text-xs">/hr</span>
          </span>
          <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-orange-500 group-hover:to-amber-500 transition-all">
            View profile →
          </span>
        </div>
      </div>
    </Link>
  );
}