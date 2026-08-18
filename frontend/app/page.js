import Link from "next/link";
import Scene from "@/components/art/Scene";
import { sceneForActivity } from "@/components/art/sceneFor";
import CompanionCard from "@/components/CompanionCard";
import { api } from "@/lib/api";
import { ACTIVITIES } from "@/lib/activities";
import { CITIES, CITY_INFO, citySlug } from "@/lib/cities";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "1. Browse companions",
    text: "Search free — no signup needed. Filter by city, date, interests and languages to find a local you'd enjoy spending time with.",
  },
  {
    title: "2. Book & chat",
    text: "Send a booking request for an activity — sightseeing, dinner, museums, coffee. Negotiate details in our in-app chat.",
  },
  {
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

async function getLatestReviews() {
  try {
    const reviews = await api("/reviews/latest?limit=6");
    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await getFeatured();
  const reviews = await getLatestReviews();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-emerald-900 text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 80% at 80% 20%, rgba(52,211,153,.35) 0%, rgba(16,185,129,.12) 45%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-[1.1fr_1fr] items-center gap-12">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-emerald-50 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                Kenya's verified friendship platform — strictly platonic
              </span>
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Travel Kenya. <br />
                <span className="text-emerald-300">Never alone.</span>
              </h1>
              <p className="mt-5 text-lg text-emerald-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A friend you can trust in every town. Pamoja connects travellers with vetted, verified
                locals for safe, platonic hangouts across Kenya — sightseeing, dining, coffee and real
                conversation.{" "}
                <strong className="text-emerald-300">Strictly platonic. Purely social.</strong>
              </p>
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/search" className="btn-cta px-8 py-4 text-lg shadow-xl">
                  Find a Companion — free to browse
                </Link>
                <Link
                  href="/become-companion"
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-colors"
                >
                  Become a Companion
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap justify-center lg:justify-start items-center gap-x-8 gap-y-2 text-sm text-emerald-100">
                <span>Manually approved profiles</span>
                <span>Mandatory ID verification</span>
                <span>Strictly 18+</span>
                <span>Two-way reviews</span>
                <span>Monitored chats</span>
              </div>
            </div>

            <div className="relative hidden sm:block">
              <div className="absolute -inset-4 rounded-[2rem] bg-emerald-500/30 blur-2xl" />
              <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/20 shadow-2xl">
                <Scene variant="savanna" uid="hero" className="block w-full h-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/90 to-transparent px-6 pt-14 pb-5">
                  <p className="font-extrabold text-lg">Two friends, one beautiful country</p>
                  <p className="text-emerald-100 text-sm">
                    Nairobi savanna, Mombasa coast, Naivasha highlands — a verified local by your side in
                    every corner.
                  </p>
                </div>
              </div>
              <div className="absolute -top-5 -right-5 bg-white text-emerald-900 rounded-2xl shadow-xl px-4 py-3 text-sm font-extrabold">
                10 cities · 46 hangouts
              </div>
              <div className="absolute -bottom-5 -left-5 bg-emerald-600 rounded-2xl shadow-xl px-4 py-3 text-sm font-extrabold">
                15% goes to Pamoja · 85% stays local
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-3">What is Pamoja?</h2>
          <p className="text-stone-500 text-center max-w-2xl mx-auto mb-10">
            A vetted friend by your side for any hangout in Kenya — nothing more, nothing less.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-emerald-800 mb-2">Vetted & verified locals</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Every companion is manually approved and ID-verified before joining, with public reviews to match.
                Who you meet is who they say they are.
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-emerald-800 mb-2">Platonic only, enforced</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                No dating, no romance, no adult services. Profile, chat and booking language is monitored
                by our team and enforced.
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-emerald-800 mb-2">Free to browse, simple booking</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Search, profiles and messaging are free. Book a companion from their listed rate — you
                pay only for the hangout you plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-3">
          Find companions in <span className="text-emerald-700">every corner of Kenya</span>
        </h2>
        <p className="text-stone-500 text-center mb-8">Dedicated city pages with locals, highlights and things to do</p>
        <div className="flex flex-wrap justify-center gap-3">
          {CITIES.map((city) => (
            <Link
              key={city}
              href={`/cities/${citySlug(city)}`}
              className="px-5 py-2.5 bg-white border border-stone-200 rounded-full font-semibold text-stone-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors shadow-sm"
            >
              {city}
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
      <section className="bg-stone-50 border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold">
                Anything you'd enjoy <span className="text-emerald-700">more with a friend</span>
              </h2>
              <p className="text-stone-500 mt-1">Every kind of hangout — all platonic, all social</p>
            </div>
            <Link href="/activities" className="text-emerald-700 font-bold hover:underline">Browse all activities →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ACTIVITIES.slice(0, 15).map((a, i) => (
              <Link
                key={a.value}
                href={`/search?activity=${a.value}`}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-300 transition-all"
              >
                <Scene
                  variant={sceneForActivity(a.label)}
                  uid={`act${i}`}
                  className="block h-16 w-full group-hover:scale-105 transition-transform duration-300"
                />
                <span className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-stone-700 group-hover:text-emerald-700">
                  {a.label}
                </span>
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
      <section className="bg-stone-50 border-y border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-3">
            Travellers love <span className="text-emerald-700">Pamoja</span>
          </h2>
          <p className="text-stone-500 text-center text-sm">
            Real reviews from real hangouts across Kenya.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {reviews.length > 0
              ? reviews.slice(0, 6).map((r) => (
                  <figure key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <div className="text-emerald-500 mb-3">{"★".repeat(Math.max(0, Math.min(5, r.rating || 5)))}</div>
                    <blockquote className="text-stone-600 text-sm leading-relaxed">
                      "{r.comment || "Wonderful time together — friendly, punctual and great company."}"
                    </blockquote>
                    <figcaption className="mt-4 font-bold text-stone-800 text-sm">
                      {r.reviewer_name || "A member"}
                      <span className="text-stone-400 font-normal">
                        {r.reviewee_name ? ` with ${r.reviewee_name}` : ""} · {new Date(r.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </span>
                    </figcaption>
                  </figure>
                ))
              : TESTIMONIALS.map((t) => (
                  <figure key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                    <div className="text-emerald-500 mb-3">★★★★★</div>
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
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold mb-4">Safety is non-negotiable</h2>
              <ul className="space-y-3 text-emerald-50">
                <li>Manual approval & mandatory ID verification for every companion</li>
                <li>Report, block and suspend — monitored by our team</li>
                <li>Emergency contact saved per member</li>
                <li>Two-way reviews after every completed booking</li>
                <li>First meetups encouraged in public places</li>
              </ul>
            </div>
            <div className="text-center">
              <Link href="/safety" className="inline-block bg-white hover:bg-emerald-50 text-emerald-800 font-bold px-8 py-4 rounded-xl shadow-lg transition-colors">
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