import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Search — free, no account",
    items: [
      "Browse companions by city, gender, activity, date, interests and languages",
      "View full profiles: photos, bio, rates, reviews and availability",
      "No signup, no cost. Like looking over a friend's shoulder.",
    ],
  },
  {
    n: "02",
    title: "Join as a member",
    items: [
      "Create a free account — we never charge travellers to browse",
      "Companions join free too and set their own hourly rate in KSH",
      "Email verification keeps the community genuine",
    ],
  },
  {
    n: "03",
    title: "Message & agree details",
    items: [
      "Use in-app chat — your personal contact stays private",
      "Agree the activity, meeting point and exact hours",
      "Rates are often negotiable; some companions even waive fees for great experiences",
    ],
  },
  {
    n: "04",
    title: "Send a booking request",
    items: [
      "Book a date, hours and activity with a clear total",
      "The companion accepts or declines within the platform",
      "You'll see the hourly rate, total, and our small commission transparently",
    ],
  },
  {
    n: "05",
    title: "Meet in a public place",
    items: [
      "Meet somewhere public you both agree on",
      "A friendly local shows you around — strictly platonic",
      "Share your location and emergency contact with someone you trust",
    ],
  },
  {
    n: "06",
    title: "Review each other",
    items: [
      "After a completed booking both sides leave a rating and review",
      "Reviews are visible on profiles, keeping the community accountable",
      "Report anything off — our moderation team responds fast",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-center">How Pamoja works</h1>
      <p className="text-stone-500 text-center mt-3 max-w-2xl mx-auto">
        From browsing to meeting — everything happens in one safe, transparent place. Inspired by the
        RentAFriend model that has connected millions of people for platonic friendship around the world.
      </p>

      <div className="mt-14 space-y-8">
        {STEPS.map((s) => (
          <div key={s.n} className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-sm flex gap-6">
            <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white text-2xl font-extrabold shadow">
              {s.n}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">{s.title}</h2>
              <ul className="space-y-2 text-stone-600">
                {s.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span> {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-emerald-800 mb-3">Strictly platonic — always</h2>
        <p className="text-emerald-800/80 max-w-2xl mx-auto mb-6">
          Pamoja is for friendship and social activities only. Dating, romance, sexual or adult services
          are banned, and our team enforces this through profile approval, language monitoring and reports.
        </p>
        <Link href="/register" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors">
          Join free today
        </Link>
      </div>
    </div>
  );
}