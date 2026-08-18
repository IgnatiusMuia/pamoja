"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import FavHeart from "./FavHeart";
import Stars from "./Stars";
import Scene from "./art/Scene";
import { sceneForCity } from "./art/sceneFor";

export default function CompanionCard({ companion }) {
  return (
    <Link
      href={`/companions/${companion.id}`}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-stone-200/80 overflow-hidden flex flex-col hover:border-emerald-300"
    >
      <div className="relative h-40 overflow-hidden">
        <Scene
          variant={sceneForCity(companion.city)}
          uid={`cc${companion.id}`}
          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-transparent" />
        <FavHeart
          companionId={companion.id}
          className="absolute top-3 right-3 h-8 w-8"
        />
        {companion.verified_id && (
          <span className="absolute top-3 left-3 bg-white text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            ✓ Verified
          </span>
        )}
        {companion.is_featured && (
          <span className={companion.verified_id ? "absolute top-12 left-3 bg-stone-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md" : "absolute top-3 left-3 bg-stone-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md"}>
            ★ Featured
          </span>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <Avatar user={companion} size="lg" className="h-20 w-20 text-3xl ring-4 ring-white shadow-xl" />
        </div>
      </div>
      <div className="p-5 flex flex-col gap-1.5 grow">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-stone-900 group-hover:text-emerald-700 transition-colors">
              {companion.name}
            </h3>
            <p className="text-sm text-stone-500">{companion.city}</p>
          </div>
          <Stars rating={companion.rating_avg} count={companion.rating_count} />
        </div>
        <p className="text-sm text-stone-600 line-clamp-2">{companion.tagline || companion.description}</p>
        {companion.activity_types?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {companion.activity_types.slice(0, 3).map((a) => (
              <span key={a} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {a.replace(/_/g, " ")}
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
          <span className="text-sm font-bold text-emerald-700">
            View profile →
          </span>
        </div>
      </div>
    </Link>
  );
}