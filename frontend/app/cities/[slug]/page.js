import Link from "next/link";
import { notFound } from "next/navigation";
import CompanionCard from "@/components/CompanionCard";
import { api } from "@/lib/api";
import { ACTIVITIES } from "@/lib/activities";
import { CITY_INFO, CITIES, citySlug, slugToCity } from "@/lib/cities";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: citySlug(c) }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const city = slugToCity(slug);
  if (!city) return { title: "Pamoja" };
  return {
    title: `${city} Companions | Pamoja`,
    description: CITY_INFO[city].intro.slice(0, 150),
  };
}

export default async function CityPage({ params }) {
  const { slug } = await params;
  const city = slugToCity(slug);
  if (!city) notFound();

  const info = CITY_INFO[city];
  let companions = [];
  try {
    companions = await api(`/companions?city=${encodeURIComponent(city)}&page_size=48`);
  } catch {
    // backend down — show empty grid with helpful message
  }

  return (
    <div>
      {/* city hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-700 to-amber-500 text-white">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-64 w-64 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 relative">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-emerald-50 text-sm font-semibold px-4 py-2 rounded-full mb-5">
            {info.emoji} {city} companions
          </span>
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
            {info.tagline} — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">meet a friendly local</span>
          </h1>
          <p className="mt-4 text-lg text-emerald-100 max-w-2xl leading-relaxed">{info.intro}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {info.highlights.map((h) => (
              <span key={h} className="bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                ✨ {h}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="#companions" className="btn-cta px-7 py-3.5 shadow-xl">
              Browse {city} companions
            </Link>
            <Link href={`/search?city=${encodeURIComponent(city)}`} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-7 py-3.5 rounded-2xl transition-colors backdrop-blur">
              Search with filters →
            </Link>
          </div>
        </div>
      </section>

      {/* companions */}
      <section id="companions" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold">
              Companions in <span className="text-emerald-700">{city}</span>
            </h2>
            <p className="text-stone-500 mt-1">
              {companions.length > 0
                ? `${companions.length} local${companions.length !== 1 ? "s" : ""} ready to show you the city — strictly platonic`
                : "No companions in this city yet — but browse nearby cities below."}
            </p>
          </div>
          <Link href="/become-companion" className="text-emerald-700 font-bold text-sm hover:underline">
            Want to be featured in {city}? Apply →
          </Link>
        </div>

        {companions.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companions.map((c) => (
              <CompanionCard key={c.id} companion={c} />
            ))}
          </div>
        ) : (
          <Link href="/search" className="block text-center bg-white border-2 border-dashed border-stone-300 rounded-3xl py-16 text-stone-500 hover:border-emerald-400 hover:text-emerald-700 transition-colors">
            <span className="text-4xl block mb-2">🔍</span>
            No companions in {city} yet — explore all of Kenya →
          </Link>
        )}
      </section>

      {/* popular activities in this city */}
      <section className="bg-white border-y border-stone-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold mb-2">
            Popular things to do in {city}
          </h2>
          <p className="text-stone-500 mb-8">Book a companion for any of these — or dream up your own plan together.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ACTIVITIES.slice(0, 12).map((a) => (
              <Link
                key={a.value}
                href={`/search?activity=${a.value}&city=${encodeURIComponent(city)}`}
                className="group bg-stone-50 hover:bg-emerald-50 rounded-2xl border border-stone-200 hover:border-emerald-300 p-4 transition-all hover:-translate-y-0.5"
              >
                <span className="text-2xl block mb-1.5">{a.emoji}</span>
                <span className="text-sm font-bold text-stone-700 group-hover:text-emerald-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* other cities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl font-extrabold mb-6">Explore more Kenyan cities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CITIES.filter((c) => c !== city).map((c) => (
            <Link
              key={c}
              href={`/cities/${citySlug(c)}`}
              className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-700 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
            >
              <span>{CITY_INFO[c].emoji}</span> {c}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}