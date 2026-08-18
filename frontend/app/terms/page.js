export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-stone-700">
      <h1 className="text-3xl font-extrabold mb-6 text-stone-900">Terms of Service</h1>
      <p className="text-sm text-stone-400 mb-8">Last updated: August 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">1. Our service</h2>
          <p>
            Pamoja is a platform connecting solo travellers with local companions for strictly platonic,
            social activities in Kenya. We facilitate introductions, bookings and reviews; we are not a
            dating service, and we are not an employer of companions.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">2. The strictly platonic boundary</h2>
          <p>
            Pamoja is for friendship only. The following are strictly prohibited and lead to immediate
            suspension, removal and reporting where appropriate:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Dating, romantic or sexual requests, language or behaviour</li>
            <li>Offers of or requests for adult or sexual services in any form</li>
            <li>Solicitation, escorting, or any monetised non-platonic arrangements</li>
            <li>Harassment, abuse, discrimination or hate speech</li>
            <li>Scams, fraud or payments occurring outside the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">3. Accounts & age eligibility</h2>
          <p>
            Pamoja is strictly for members aged 18 and over. By creating an account you confirm you are
            18 or older; underage use is prohibited and accounts found to belong to minors are removed
            permanently. You agree to provide accurate information. Accounts are personal —
            do not share logins. We may suspend accounts that violate these terms or the Community Guidelines.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">4. Companion rates & commission</h2>
          <p>
            Companions set their own hourly rates in Kenyan Shillings. Bookings display the total, our
            commission (15%) and the companion's payout transparently. Pamoja earns only when a booking
            completes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">5. Behaviour & liability</h2>
          <p>
            You are responsible for your own conduct in person. Pamoja does not guarantee the background,
            behaviour or identity of any member. Always follow our safety guidelines, meet in public places,
            and report concerns promptly. By using Pamoja you agree that your use is at your own risk,
            within the law of the Republic of Kenya.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">6. Termination</h2>
          <p>
            You may delete your account at any time via support. We may suspend or terminate accounts that
            breach these terms, with or without notice, including blocking repeat offenders.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">7. Changes</h2>
          <p>We may update these terms from time to time. Continued use after changes constitutes acceptance.</p>
        </section>
      </div>
    </div>
  );
}