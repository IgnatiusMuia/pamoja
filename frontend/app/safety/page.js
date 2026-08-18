import Link from "next/link";

const RULES = [
  {
    title: "Adults only — strictly 18+",
    text: "Pamoja is a platform for adults. Every member confirms they are 18 or older when joining, and any account found to be under 18 is permanently removed.",
  },
  {
    title: "Profile approval",
    text: "Every companion profile is manually reviewed and ID-verified before it appears in search. ID verification is a mandatory part of our recruitment policy.",
  },
  {
    title: "Strictly platonic boundary",
    text: "Pamoja exists for friendship only. Dating, romance, sexual or adult requests are prohibited across profiles, messages and bookings. Violations lead to immediate suspension or removal.",
  },
  {
    title: "Two-way reviews",
    text: "After every completed booking, both the traveller and companion rate each other. Honest reviews are the backbone of our community.",
  },
  {
    icon: "️",
    title: "Report & block",
    text: "Report any member from their profile or chat at any time. Blocking hides you from them instantly and stops messages.",
  },
  {
    title: "Emergency contact",
    text: "Store an emergency contact in your account. In case of concern, you or authorities can reach them — we never share personal data without verified reason.",
  },
  {
    title: "Zero tolerance",
    text: "Harassment, inappropriate messages, scams or abuse → account suspended and reported where appropriate. Our moderation team responds to reports within 24 hours.",
  },
];

const TIPS = [
  "Always meet in a busy, public place for the first meeting — café, mall, museum, hotel lobby.",
  "Share your plans with a friend or family member: who you're meeting, where, and when.",
  "Keep communication on the platform until you've met — never share your address or PIN.",
  "Agree the activity, time, duration and rate in the chat before meeting.",
  "Trust your instincts. If something feels off, cancel, block and report.",
  "Never send money outside the platform or pay in advance for 'extras'.",
  "Feel free to end a meetup at any time. 'No' is a complete sentence.",
  "In an emergency, call Kenya Police (999 / 112) or Kenya Red Cross (1199) first.",
];

export default function SafetyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-center">Safety & trust</h1>
      <p className="text-stone-500 text-center mt-3 max-w-2xl mx-auto">
        Pamoja is Kenya's friendship network: a platform where platonic friendship is safe, simple and
        respectful. Trust and safety are built into every part of the experience.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {RULES.map((r) => (
          <div key={r.title} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg mb-2">{r.title}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-emerald-700 rounded-3xl p-8 lg:p-10 text-white">
        <h2 className="text-2xl font-extrabold mb-6">Meeting safety tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TIPS.map((t) => (
            <div key={t} className="flex gap-3 items-start bg-white/10 rounded-xl p-4 text-sm leading-relaxed">
              <span className="text-emerald-300 font-bold">✓</span> {t}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <h3 className="font-bold text-lg text-stone-800 mb-2">See something wrong?</h3>
        <p className="text-stone-500 text-sm mb-5">Report a profile from its page, or contact our team directly.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/guidelines" className="bg-emerald-600 text-white font-bold px-7 py-3 rounded-xl hover:bg-emerald-700">Community guidelines</Link>
          <Link href="/terms" className="bg-white border-2 border-emerald-600 text-emerald-700 font-bold px-7 py-3 rounded-xl hover:bg-emerald-50">Terms of service</Link>
        </div>
      </div>
    </div>
  );
}