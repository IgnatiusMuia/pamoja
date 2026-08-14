export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-stone-700">
      <h1 className="text-3xl font-extrabold mb-6 text-stone-900">Privacy Policy</h1>
      <p className="text-sm text-stone-400 mb-8">Last updated: August 2026 — compliant with the Kenya Data Protection Act, 2019</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">1. What we collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Account details: name, email, password (hashed), role, gender, city</li>
            <li>Profile content: bio, interests, languages, photos, hourly rate, availability</li>
            <li>Activity: bookings, messages, reviews, reports and blocks</li>
            <li>Optional safety data: ID verification status, emergency contact details</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">2. How we use it</h2>
          <p>
            To operate the platform: matching, booking, messaging, reviews, moderation, safety enforcement
            and customer support. We never sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">3. What we never reveal</h2>
          <p>
            Your phone number, exact location or emergency contact are never shown to other members unless
            you choose to share them. We never publish your email or contact details on profiles.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">4. Sharing</h2>
          <p>
            We share data only: (a) with service providers who run the infrastructure, (b) to comply with
            lawful requests from Kenyan authorities, or (c) in an emergency, to emergency contacts you have
            authorised or to response services.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">5. Your rights</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Access and correct your personal data</li>
            <li>Request deletion of your account and data</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with the Office of the Data Protection Commissioner (ODPC)</li>
          </ul>
          <p className="mt-2">Contact us at support@pamoja.ke to exercise any right.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-stone-900 mb-2">6. Security</h2>
          <p>
            Passwords are hashed with bcrypt. Connections are encrypted (HTTPS). We keep logs only as long
            as needed for safety and moderation.
          </p>
        </section>
      </div>
    </div>
  );
}