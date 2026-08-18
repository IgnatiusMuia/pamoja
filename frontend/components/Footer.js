import Link from "next/link";
import { CITIES, CITY_INFO, citySlug } from "@/lib/cities";

export default function Footer() {
  return (
    <footer className="mt-auto bg-stone-950 text-stone-300 relative">
      <div className="h-1 bg-emerald-600" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-emerald-600 text-white font-extrabold rounded-xl px-2.5 py-1.5 shadow-md">P</span>
            <span className="font-extrabold text-xl text-white">Pamoja<span className="text-emerald-400">.</span></span>
          </div>
          <p className="text-sm text-stone-400">
            A friend you can trust in every town. Pamoja connects travellers with vetted, verified
            local companions for safe, platonic hangouts across Kenya.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-emerald-400" href="/search">Find a Companion</Link></li>
            <li><Link className="hover:text-emerald-400" href="/activities">Activities</Link></li>
            <li><Link className="hover:text-emerald-400" href="/become-companion">Become a Companion</Link></li>
            <li><Link className="hover:text-emerald-400" href="/how-it-works">How It Works</Link></li>
            <li><Link className="hover:text-emerald-400" href="/pricing">Pricing & Commission</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Cities</h4>
          <ul className="space-y-2 text-sm">
            {CITIES.slice(0, 6).map((c) => (
              <li key={c}>
                <Link className="hover:text-emerald-400" href={`/cities/${citySlug(c)}`}>
                  {c}
                </Link>
              </li>
            ))}
            <li><Link className="hover:text-emerald-400 text-emerald-400" href="/search">All cities →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">Trust & Safety</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-emerald-400" href="/safety">Safety & Code of Conduct</Link></li>
            <li><Link className="hover:text-emerald-400" href="/guidelines">Community Guidelines</Link></li>
            <li><Link className="hover:text-emerald-400" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-emerald-400" href="/terms">Terms of Service</Link></li>
            <li className="pt-2 text-stone-400">support@pamoja.ke</li>
            <li className="text-stone-500">Nairobi, Kenya · Built in Kenya</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Pamoja. Strictly 18+. Strictly platonic companionship. No dating, no romance, no adult services — ever.
      </div>
    </footer>
  );
}