import Link from "next/link";

export default function BecomeCompanionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-center">
        Become a <span className="text-emerald-700">companion</span>
      </h1>
      <p className="text-stone-500 text-center mt-3 max-w-2xl mx-auto">
        Love your city? Meet travellers, share experiences, and earn from your time — at a rate you choose.
        Companions join free, just like on RentAFriend.
      </p>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          ["💵", "Set your own rate", "You decide your hourly rate in KSH — start low to build reviews, raise it as you go."],
          ["🗓️", "Full control", "Choose your activities, weekly availability and how many bookings you take."],
          ["🌍", "Meet the world", "Hosts and travellers from every continent pass through Kenya's cities and beaches."],
        ].map(([icon, title, text]) => (
          <div key={title} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-stone-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-emerald-700 rounded-3xl p-8 lg:p-10 text-white">
        <h2 className="text-2xl font-extrabold mb-6">What makes a great companion?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Friendly, warm and welcoming",
            "Knows good spots in their city",
            "Comfortable chatting with strangers",
            "Respectful, reliable and punctual",
            "Takes safety seriously",
            "Understands: strictly platonic",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 text-sm">
              <span className="text-orange-300 font-bold">✓</span> {t}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Getting approved</h2>
        <ol className="space-y-3 text-stone-600 text-sm">
          <li><strong>1.</strong> Register with your real name and email — choose "Companion" as your role.</li>
          <li><strong>2.</strong> Complete your profile: bio, photo, interests, rate and availability.</li>
          <li><strong>3.</strong> Our team manually reviews and approves you (usually within 24 hours).</li>
          <li><strong>4.</strong> Add optional ID verification to earn the trusted ✓ badge.</li>
          <li><strong>5.</strong> Start receiving booking requests and messages.</li>
        </ol>
        <div className="mt-6 text-center">
          <Link
            href="/register?role=companion"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow"
          >
            Sign up as a companion — free
          </Link>
        </div>
      </div>
    </div>
  );
}