import Link from "next/link";
import CompanionCard from "@/components/CompanionCard";
import { api } from "@/lib/api";
import { ACTIVITIES } from "@/lib/activities";

export const dynamic = "force-dynamic";

const POPULAR = ["city_tours", "coffee", "museums", "dining", "beaches", "hiking", "photography", "wildlife"];

const CITIES = [
  "Nairobi", "Mombasa", "Diani", "Kisumu", "Nakuru",
  "Eldoret", "Nyeri", "Malindi", "Lamu", "Naivasha",
];

const STEPS = [
  {
    icon: "🔍",
    title: "1. Browse companions",
    text: "Search free — no signup needed. Filter by city, date, interests and languages to find a local you'd enjoy spending time with.",
  },
  {
    icon: "🤝",
    title: "2. Book & chat",
    text: "Send a booking request for an activity — sightseeing, dinner, museums, coffee. Negotiate details in our in-app chat.",
  },
  {
    icon: "🌍",
    title: "3. Meet & explore",
    text: "Meet in a public place, explore your city together, then rate each other afterwards. Reviews keep everyone accountable.",
  },
];

const TESTIMONIALS = [
  {
    name: "Emma, UK",
    text: "I was nervous travelling to Nairobi alone. Pamoja matched me with Wanjiru — we explored the Maasai Market and had the best coffee. Felt safe the whole time, like travelling with a friend.",
  },
  {
    name: "David, USA",
    text: "As a solo traveller in Mombasa, having Fatuma show me Old Town was priceless. The ID verification and reviews made me feel secure booking.",
  },
  {
    name: "Grace, Kenya",
    text: "I love meeting travellers from all over the world. Pamoja pays my rate fairly and the bookings are always respectful and platonic.",
  },
];

async function getFeatured() {
  try {
    const featured = await api("/companions?sort=rating&page_size=6");
    return featured;
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await getFeatured();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-emerald-800 to-amber-600 text-white">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-orange-500/20 blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-emerald-50 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
              Kenya's platonic travel companion platform
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Travel Kenya. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Never alone.</span>
            </h1>
            <p className="mt-5 text-lg text-emerald-100 max-w-xl leading-relaxed">
              Find friendly, vetted locals to explore Nairobi, Mombasa, Diani and beyond — sightseeing,
              dining, museums, coffee, and real conversation.{" "}
              <strong className="text-amber-200">Strictly platonic. Purely social.</strong>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/search" className="btn-cta px-8 py-4 text-lg shadow-xl">
                Find a Companion — free to browse
              </Link>
              <Link
                href="/become-companion"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-colors backdrop-blur"
              >
                Become a Companion
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-emerald-100">
              <span className="flex items-center gap-2">✅ Free browsing</span>
              <span className="flex items-center gap-2">🪪 ID-verified members</span>
              <span className="flex items-center gap-2">⭐ Reviewed & rated</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative">
            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg rotate-3">
              45+ activities
            </div>
            <h3 className="font-bold text-xl mb-4">Popular activities</h3>
            <div className="grid grid-cols-2 gap-3">
              {POPULAR.map((v) => {
                const a = ACTIVITIES.find((x) => x.value === v);
                return (
                  <Link key={v} href={`/search?activity=${v}`} className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2">
                    <span>{a.emoji}</span> {a.label}
                  </Link>
                );
              })}
            </div>
            <Link href="/activities" className="mt-4 inline-block text-sm font-bold text-amber-200 hover:text-amber-100">
              + 40 more ways to hang out →
            </Link>
            <div className="mt-6 rounded-xl bg-amber-400/15 border border-amber-300/30 p-4 text-sm">
              <strong className="text-amber-200">Our promise:</strong>{" "}
              <span className="text-amber-100">no dating, no romance, no adult services — profile, chat and booking language is monitored and enforced.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-8">
          Find companions in <span className="text-emerald-700">every corner of Kenya</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {CITIES.map((city) => (
            <Link
              key={city}
              href={`/search?city=${encodeURIComponent(city)}`}
              className="px-5 py-2.5 bg-white border border-stone-200 rounded-full font-semibold text-stone-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors shadow-sm"
            >
              📍 {city}
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-12">
            How Pamoja works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.title} className="bg-stone-50 rounded-2xl p-6 border border-stone-200 hover:border-emerald-300 transition-colors">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/how-it-works" className="text-emerald-700 font-bold hover:underline">
              Read the full guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ACTIVITY BAND */}
      <section className="bg-gradient-to-r from-sky-50 via-amber-50 to-emerald-50 border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold">
                Anything you'd enjoy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">more with a friend</span>
              </h2>
              <p className="text-stone-500 mt-1">45 ways to spend time together — all platonic, all social</p>
            </div>
            <Link href="/activities" className="text-emerald-700 font-bold hover:underline">Browse all activities →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ACTIVITIES.slice(0, 15).map((a, i) => (
              <Link
                key={a.value}
                href={`/search?activity=${a.value}`}
                className={`group bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all ${
                  i % 3 === 1 ? "hover:border-amber-300" : "hover:border-emerald-300"
                }`}
              >
                <span className="text-2xl block mb-2">{a.emoji}</span>
                <span className="text-sm font-bold text-stone-700 group-hover:text-emerald-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold">Top-rated companions</h2>
            <p className="text-stone-500 mt-1">Loved by travellers across Kenya and the world</p>
          </div>
          <Link href="/search" className="hidden sm:block text-emerald-700 font-bold hover:underline">
            See all →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => (
              <CompanionCard key={c.id} companion={c} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-center py-10">Start your backend server to see companions.</p>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gradient-to-br from-sky-50 to-emerald-50 border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-12">
            Travellers love <span className="text-emerald-700">Pamoja</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="text-amber-400 mb-3">★★★★★</div>
                <blockquote className="text-stone-600 text-sm leading-relaxed">"{t.text}"</blockquote>
                <figcaption className="mt-4 font-bold text-stone-800 text-sm">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-emerald-700 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 bg-orange-400/20 rounded-full" />
          <div className="absolute -right-2 -top-2 h-24 w-24 bg-orange-400/20 rounded-full" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold mb-4">Safety is non-negotiable</h2>
              <ul className="space-y-3 text-emerald-50">
                <li>🪪 Manual approval & optional ID verification for every companion</li>
                <li>🛡️ Report, block and suspend — monitored by our team</li>
                <li>🚨 Emergency contact saved per member</li>
                <li>📝 Two-way reviews after every completed booking</li>
                <li>☕ First meetups encouraged in public places</li>
              </ul>
            </div>
            <div className="text-center">
              <Link href="/safety" className="inline-block bg-orange-500 hover:bg-orange-600 font-bold px-8 py-4 rounded-xl shadow-lg transition-colors">
                Read our Safety Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <h2 className="text-2xl lg:text-4xl font-extrabold mb-4">Ready to meet your next friend in Kenya?</h2>
        <p className="text-stone-500 mb-8 max-w-2xl mx-auto">
          Browsing is completely free. Join to message companions, book activities and start exploring
          with a friendly local by your side.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-colors">
            Create a free account
          </Link>
          <Link href="/search" className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-4 rounded-xl transition-colors">
            Browse companions first
          </Link>
        </div>
      </section>
    </div>
  );
}