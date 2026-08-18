import Link from "next/link";
import { ACTIVITIES } from "@/lib/activities";

export const metadata = {
  title: "Activities — ways to meet & hang out",
};

export default function ActivitiesPage() {
  return (
    <div className="bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wide">
            Ways to use Pamoja
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
            There's a <span className="text-emerald-700">companion for everything</span>
          </h1>
          <p className="mt-4 text-stone-600 text-lg leading-relaxed">
            Coffee, safaris, gym sessions, weddings, language practice — if you'd enjoy it more with a
            friend, Pamoja has a local who'd love to join. All strictly platonic.
          </p>
        </div>

        {/* grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITIES.map((a, i) => (
            <div
              key={a.value}
              className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col"
            >
<div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md mb-4">
                  {a.label[0]}
                </div>
              <h2 className="font-bold text-lg text-stone-900">{a.label}</h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed grow">{a.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-3xl bg-emerald-700 p-10 lg:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-black/10" />
          <h2 className="relative text-3xl lg:text-4xl font-extrabold mb-3">Found your activity?</h2>
          <p className="relative text-emerald-50 max-w-xl mx-auto mb-8">
            Now find the perfect local companion for it — browse profiles free, filter by city and date,
            then book in a few taps.
          </p>
          <div className="relative flex flex-wrap justify-center gap-4">
            <Link href="/search" className="bg-white text-emerald-800 font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-[1.02] hover:bg-amber-50 transition-all">
              Find a companion
            </Link>
            <Link href="/become-companion" className="bg-white/15 border border-white/40 font-bold px-8 py-4 rounded-2xl hover:bg-white/25 transition-colors">
              Offer this activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}