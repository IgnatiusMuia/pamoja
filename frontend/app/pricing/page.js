import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-center">Simple, transparent pricing</h1>
      <p className="text-stone-500 text-center mt-3 max-w-2xl mx-auto">
        A friend you can trust in every town. Travellers browse free; companions keep listings live
        with a small monthly fee, and Pamoja earns 15% only when a booking completes.
      </p>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg">Travellers</h3>
          <p className="text-3xl font-extrabold text-emerald-700 mt-3">Free</p>
          <p className="text-sm text-stone-500 mt-1">to join, browse & message</p>
          <ul className="mt-5 space-y-2 text-sm text-stone-600 grow">
            <li>✓ Search vetted companions with filters</li>
            <li>✓ Free messaging — contact details stay private</li>
            <li>✓ Booking requests at the companion's hourly rate</li>
            <li>✓ Two-way reviews after every completed booking</li>
          </ul>
        </div>

        <div className="bg-emerald-700 text-white rounded-2xl p-6 shadow-lg flex flex-col relative">
          <span className="absolute -top-3 left-6 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST COMMON</span>
          <h3 className="font-bold text-lg">Companions</h3>
          <p className="text-3xl font-extrabold mt-3">KES 300<span className="text-base font-bold text-emerald-100">/month</span></p>
          <p className="text-sm text-emerald-100 mt-1">monthly listing fee — keep your profile live in search</p>
          <ul className="mt-5 space-y-2 text-sm text-emerald-50 grow">
            <li>✓ Set your own hourly rate (from 100 KSH/hr)</li>
            <li>✓ Choose your activities, interests and availability</li>
            <li>✓ Meet travellers from around the world</li>
            <li>✓ Pause or renew any month — no lock-in</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg">Commission</h3>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">15%</p>
          <p className="text-sm text-stone-500 mt-1">per completed booking</p>
          <ul className="mt-5 space-y-2 text-sm text-stone-600 grow">
            <li>✓ Shown transparently on every booking</li>
            <li>✓ Only charged when a booking completes</li>
            <li>✓ Covers moderation, safety and platform costs</li>
            <li>✓ No hidden fees, ever</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 bg-stone-100 border border-stone-200 rounded-2xl p-6 text-sm text-stone-600">
        <p>
          <strong>Example:</strong> Wanjiru charges 1,500 KSH/hr and keeps her listing active at
          KES 300/month. You book her for 3 hours = 4,500 KSH total. Pamoja's commission is
          675 KSH (15%) — Wanjiru receives 3,825 KSH. You see exactly this breakdown on your
          booking confirmation.
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link href="/register" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors">
          Join free as a traveller — browse now
        </Link>
      </div>
    </div>
  );
}