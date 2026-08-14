import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-center">Simple, transparent pricing</h1>
      <p className="text-stone-500 text-center mt-3 max-w-2xl mx-auto">
        Like RentAFriend, browsing is free and companions set their own rates. Pamoja only earns a
        small commission when a booking happens.
      </p>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg">Travellers</h3>
          <p className="text-3xl font-extrabold text-emerald-700 mt-3">Free</p>
          <p className="text-sm text-stone-500 mt-1">to join & browse</p>
          <ul className="mt-5 space-y-2 text-sm text-stone-600 grow">
            <li>✓ 100% free search with filters</li>
            <li>✓ Free messaging with companions</li>
            <li>✓ Booking requests at the companion's hourly rate</li>
            <li>✓ Choose who you meet — never obliged to book</li>
          </ul>
        </div>

        <div className="bg-emerald-700 text-white rounded-2xl p-6 shadow-lg flex flex-col relative">
          <span className="absolute -top-3 left-6 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST COMMON</span>
          <h3 className="font-bold text-lg">Companions</h3>
          <p className="text-3xl font-extrabold mt-3">Free</p>
          <p className="text-sm text-emerald-100 mt-1">join as a companion — earn your rate</p>
          <ul className="mt-5 space-y-2 text-sm text-emerald-50 grow">
            <li>✓ Set your own hourly rate (from 100 KSH/hr)</li>
            <li>✓ Choose your activities and weekly availability</li>
            <li>✓ Meet travellers from around the world</li>
            <li>✓ Keep your payout: we deduct only our commission</li>
          </ul>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg">Commission</h3>
          <p className="text-3xl font-extrabold text-orange-500 mt-3">15%</p>
          <p className="text-sm text-stone-500 mt-1">per completed booking</p>
          <ul className="mt-5 space-y-2 text-sm text-stone-600 grow">
            <li>✓ Shown transparently on every booking</li>
            <li>✓ Only charged when a booking completes</li>
            <li>✓ Covers moderation, safety and platform costs</li>
            <li>✓ No hidden fees, ever</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 bg-stone-100 border border-stone-200 rounded-2xl p-6 text-sm text-stone-600 flex gap-2">
        <span className="hidden sm:block text-2xl">💡</span>
        <p>
          <strong>Example:</strong> Wanjiru charges 1,500 KSH/hr. You book her for 3 hours = 4,500 KSH total.
          Pamoja's commission is 675 KSH (15%) — Wanjiru receives 3,825 KSH. You see exactly this breakdown on
          your booking confirmation.
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link href="/register" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors">
          Join free — browse now
        </Link>
      </div>
    </div>
  );
}