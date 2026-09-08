import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Megaphone, ShieldCheck, Plug, Rocket,
  ArrowRight, CheckCircle2, Mail, Clock, HelpCircle, Gift
} from 'lucide-react'
import { companyName, infoRoutes, siteUrl, vendorRoutes } from '@/constant/routes'
import { getPlatformSetting } from '@/lib/supabase/public'

export const metadata: Metadata = {
  title: "Partner werden – Dein Vintage-Shop auf VintageFindr",
  description: "Präsentiere Vintage-Kleidung auf VintageFindr – Plattform für Vintage-Liebhaber. Prepaid-Klickguthaben flexibel aufladen. CSV-Import möglich.",
  alternates: { canonical: `${siteUrl}/partner-werden` },
}

export default async function PartnerWerdenPage() {
  const setting = await getPlatformSetting('vendor_starter_clicks')
  const starterClicks = setting ? parseInt(setting) || 30 : 30

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <header className="text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-vintage-secondary">Mehr Käufer für deinen Vintage-Shop – ohne Fixkosten</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          {companyName} bringt deinen Shop vor Käufer, die gezielt nach Vintage suchen – nach Marke, Kategorie und Größe. Kein Abo, kein Risiko. Starte mit {starterClicks} kostenlosen Klicks.
        </p>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
            <Gift className="h-5 w-5" />
            <span className="font-semibold">Neue Partner starten mit {starterClicks} kostenlosen Klicks – kein Risiko, jederzeit kündbar.</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href={vendorRoutes.register}
            className="inline-flex items-center gap-2 rounded-xl bg-vintage-primary px-5 py-2.5 text-white hover:bg-vintage-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vintage-text-vintage-secondary"
          >
            Kostenlos starten <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={infoRoutes.kontakt}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-vintage-secondary hover:bg-gray-50"
          >
            Du hast Fragen? <Mail className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Benefits */}
      <section aria-labelledby="benefits" className="mb-16">
        <h2 id="benefits" className="text-2xl font-bold text-vintage-secondary mb-6">Deine Vorteile</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="h-5 w-5 text-vintage-secondary" />
              <p className="font-semibold text-vintage-secondary">Erreiche Vintage-Liebhaber</p>
            </div>
            <p className="text-gray-700">
              Käufer mit konkreter Kaufabsicht – keine Zufalls-Besucher. Deine Produkte erscheinen gefiltert nach Marken, Kategorien und Größen.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-4">
              <Plug className="h-5 w-5 text-vintage-secondary" />
              <p className="font-semibold text-vintage-secondary">Einfache Anbindung</p>
            </div>
            <p className="text-gray-700">CSV hochladen, fertig – kein Tech-Aufwand. Produkte einzeln hinzufügen ist ebenfalls möglich.</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-vintage-secondary" />
              <p className="font-semibold text-vintage-secondary">Transparente Kosten</p>
            </div>
            <p className="text-gray-700">{starterClicks} Klicks gratis – du siehst sofort ob&apos;s funktioniert. Danach nur echte Klicks, flexibel aufladbar.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section aria-labelledby="pricing" className="mb-16">
        <h2 id="pricing" className="text-2xl font-bold text-vintage-secondary mb-6">
          Kosten und Konditionen
        </h2>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 lg:p-8 shadow-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-[20px_auto] gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 block" />
              <div>
                <p className="font-semibold text-vintage-secondary">Keine Grundgebühr</p>
                <p className="text-gray-700">Keine monatlichen Fixkosten, keine Listing-Gebühren.</p>
              </div>
            </div>

            <div className="grid grid-cols-[20px_auto] gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 block" />
              <div>
                <p className="font-semibold text-vintage-secondary">Was passiert mit gekauften Klicks?</p>
                <p className="text-gray-700">Klickguthaben bleibt 12 Monate gültig ab Kauf. Du kannst jederzeit nach kaufen. Bei Kündigung deines Accounts bleibt ungenutztes Guthaben weitere 12 Monate aktiv – du kannst also reaktivieren und weiternutzen. Danach verfällt ungenutztes Guthaben ohne Erstattung.</p>
              </div>
            </div>

            <div className="grid grid-cols-[20px_auto] gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 block" />
              <div>
                <p className="font-semibold text-vintage-secondary">Prepaid-Klickguthaben – {starterClicks} Klicks zum Start gratis</p>
                <p className="text-gray-700">
                  Neue Partner starten mit {starterClicks} kostenlosen Klicks. Danach lädst du dein Guthaben flexibel auf – nur echte Klicks werden abgerechnet, volle Kostenkontrolle.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[20px_auto] gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-vintage-secondary">Keine Mindestlaufzeit</p>
                <p className="text-gray-700">Jederzeit kündbar, keine Vertragsbindung.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="mb-16">
        <h2 id="how" className="text-2xl font-bold text-vintage-secondary mb-6">So funktioniert&apos;s</h2>
        <ol className="grid md:grid-cols-4 gap-6">
          {[
            { title: 'Anfrage senden', desc: 'Kurzformular ausfüllen und Shop vorstellen.', icon: Mail },
            { title: 'Check & Feedback', desc: 'Wir prüfen deine Infos und melden uns innerhalb von 24 Stunden.', icon: ShieldCheck },
            { title: 'Setup', desc: 'Profil erstellen und Produkte per CSV oder einzeln hochladen.', icon: Plug },
            { title: 'Live', desc: 'Deine Produkte erscheinen auf VintageFindr', icon: Rocket },
          ].map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <s.icon className="h-5 w-5 text-vintage-secondary" />
                <p className="font-semibold text-vintage-secondary">{i + 1}. {s.title}</p>
              </div>
              <p className="text-gray-700">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mb-16">
        <h2 id="faq" className="text-2xl font-bold text-vintage-secondary mb-6">Häufige Fragen</h2>
        <div className="space-y-4">
          <details className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="font-semibold text-vintage-secondary">Wie lange dauert das Onboarding?</span>
              <Clock className="h-5 w-5 text-gray-500 group-open:rotate-90 transition" />
            </summary>
            <p className="mt-3 text-gray-700">
              In der Regel 24-48 Stunden nach deiner Anfrage. Mit fertigen Produktdaten (CSV oder einzelne Uploads) kann dein Shop schnell live gehen.
            </p>
          </details>

          <details className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="font-semibold text-vintage-secondary">Brauche ich einen Produkt-Feed?</span>
              <HelpCircle className="h-5 w-5 text-gray-500 group-open:rotate-90 transition" />
            </summary>
            <p className="mt-3 text-gray-700">
              Ein Feed ist ideal, aber kein Muss. Du kannst auch manuell starten und später umstellen.
            </p>
          </details>

          <details className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="font-semibold text-vintage-secondary">Was kostet {companyName}?</span>
              <HelpCircle className="h-5 w-5 text-gray-500 group-open:rotate-90 transition" />
            </summary>
            <p className="mt-3 text-gray-700">
              Keine Grundgebühr, keine Abo-Kosten. Du lädst dein Klickguthaben flexibel auf (Prepaid-System). Neue Partner erhalten {starterClicks} kostenlose Klicks zum Start.
            </p>
          </details>

          <details className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="font-semibold text-vintage-secondary">Welche Produkte kann ich einstellen?</span>
              <HelpCircle className="h-5 w-5 text-gray-500 group-open:rotate-90 transition" />
            </summary>
            <p className="mt-3 text-gray-700">
              Vintage-Kleidung, Schuhe und Accessoires. Mindeststandards: klare Produktfotos, Größenangaben (EU/US/CM), ehrliche Zustandsbeschreibung.
            </p>
          </details>

          <details className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="font-semibold text-vintage-secondary">Kann ich jederzeit kündigen?</span>
              <HelpCircle className="h-5 w-5 text-gray-500 group-open:rotate-90 transition" />
            </summary>
            <p className="mt-3 text-gray-700">
              Ja, ohne Vertragsbindung. Du kannst dein Konto jederzeit deaktivieren. Dein Klickguthaben bleibt 12 Monate gültig, falls du später wieder aktivieren möchtest. Eine Auszahlung ungenutzter Klicks ist nicht möglich.
            </p>
          </details>

          <details className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="font-semibold text-vintage-secondary">Verfallen meine Klicks?</span>
              <HelpCircle className="h-5 w-5 text-gray-500 group-open:rotate-90 transition" />
            </summary>
            <p className="mt-3 text-gray-700">
              Ja, nach 12 Monaten ab Kauf. Du bekommst rechtzeitig eine Benachrichtigung per E-Mail, wenn Guthaben bald verfällt. Lade rechtzeitig nach, um weiter präsent zu bleiben.
            </p>
          </details>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold text-vintage-secondary">Bereit, loszulegen?</h2>
        <p className="mt-2 text-gray-700">
          Stell deinen Shop vor und erhalte in Kürze Rückmeldung zu den nächsten Schritten.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href={vendorRoutes.register}
            className="inline-flex items-center gap-2 rounded-xl bg-vintage-primary  px-5 py-2.5 text-white hover:bg-vintage-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vintage-text-vintage-secondary"
          >
            Kostenlos starten <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/kontakt"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-vintage-secondary hover:bg-gray-50"
          >
            Frage stellen <Mail className="h-4 w-4" />
          </a>
        </div>
      </footer>
    </main>
  )
}
