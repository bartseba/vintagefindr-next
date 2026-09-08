/* eslint-disable react/no-unescaped-entities -- ported legal text, literal quote characters are part of the source content */
import type { Metadata } from "next";
import { companyName, siteUrl } from "@/constant/routes";

export const metadata: Metadata = {
  title: "Preis- und Leistungsverzeichnis – Konditionen für Händler",
  description:
    "Alle Preise und Leistungen für Händler auf VintageFindr im Überblick: Gebühren, Klickpakete und Konditionen für den Verkauf von Vintage-Mode auf der Plattform.",
  robots: "index, follow",
  alternates: { canonical: `${siteUrl}/preise` },
};

export default function Preise() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Preis- und Leistungsverzeichnis
      </h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Geltungsbereich</h2>
          <p>
            Dieses Preis- und Leistungsverzeichnis gilt für die Nutzung der Plattform {companyName} durch registrierte Händler.
            Die Preise und Leistungen sind Bestandteil der Allgemeinen Geschäftsbedingungen (AGB).
          </p>
          <p className="mt-2">
            Alle Preise verstehen sich in Euro (€) zzgl. der gesetzlichen Umsatzsteuer, soweit anwendbar.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Verfügbare Pakete</h2>
          <p className="mb-4">
            {companyName} bietet verschiedene Prepaid-Klickpakete für Händler an. Die Pakete unterscheiden sich in Klick-Kontingent
            und Kosten pro Klick. Alle Pakete sind einmalige Zahlungen mit einer Gültigkeit von 12 Monaten. Klicks werden serverseitig gezählt.
          </p>

          {/* Test Paket
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Test</h3>
            <p className="text-sm text-gray-600 mb-4">Ideal zum Ausprobieren</p>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">0,50 € einmalig</p>
              <p className="text-sm text-gray-600">10 Klicks • 8 Ct/Klick</p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">Leistungen:</h4>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>10 Klicks gesamt</li>
              <li>Klick-Übersicht im Dashboard</li>
              <li>Volle Kostenkontrolle</li>
              <li>Ideal zum Ausprobieren</li>
            </ul>
          </div>
          */}
          {/* Starter Paket */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
            <p className="text-sm text-gray-600 mb-4">Ideal zum Ausprobieren</p>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">9 € einmalig</p>
              <p className="text-sm text-gray-600">150 Klicks • ca. 6 Ct/Klick</p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">Leistungen:</h4>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>150 Klicks gesamt</li>
              <li>Klick-Übersicht im Dashboard</li>
              <li>Volle Kostenkontrolle</li>
              <li>Ideal zum Ausprobieren</li>
            </ul>
          </div>

          {/* Basic Paket */}
          <div className="bg-white border border-vintage-primary rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">Basic</h3>
              <span className="px-2 py-1 bg-vintage-primary text-white text-xs font-semibold rounded">EMPFOHLEN</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Beliebtestes Paket</p>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">25 € einmalig</p>
              <p className="text-sm text-gray-600">750 Klicks • ca. 4 Ct/Klick</p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">Leistungen:</h4>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>750 Klicks gesamt</li>
              <li>Klick-Übersicht im Dashboard</li>
              <li>Volle Kostenkontrolle</li>
              <li>Beliebtestes Paket</li>
            </ul>
          </div>

          {/* Growth Paket */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth</h3>
            <p className="text-sm text-gray-600 mb-4">Für große Händler</p>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">80 € einmalig</p>
              <p className="text-sm text-gray-600">3.000 Klicks • ca. 3 Ct/Klick</p>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">Leistungen:</h4>
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>3.000 Klicks gesamt</li>
              <li>Klick-Übersicht im Dashboard</li>
              <li>Volle Kostenkontrolle</li>
              <li>Für große Händler</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">Wichtige Hinweise:</h4>
            <ul className="list-disc ml-6 space-y-1 text-blue-800 text-sm">
              <li>Alle Pakete sind Prepaid-Klickpakete mit einmaliger Zahlung</li>
              <li>Bezahlte Pakete haben eine Gültigkeit von 12 Monaten ab Kaufdatum</li>
              <li>Nicht genutzte Klicks verfallen nach diesem Zeitraum</li>
              <li>Klicks werden serverseitig gezählt und im Dashboard in Echtzeit angezeigt</li>
              <li>Dein Dashboard zeigt Echtzeit-Verbrauch und Top-5 Produkte</li>
              <li>Es gibt keine Garantie für eine bestimmte Anzahl erreichter Klicks oder Performance</li>
              <li>Ohne aktives Klick-Paket oder wenn Ihr Paket abgelaufen ist, sind Ihre Produkte nicht öffentlich sichtbar</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Zahlungsmodalitäten</h2>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Zahlungsabwicklung</h3>
          <p className="mb-2">
            Die Zahlungsabwicklung erfolgt über den Zahlungsdienstleister Stripe Payments Europe Ltd. („Stripe")
            oder einen vergleichbaren Anbieter.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">3.2 Fälligkeit</h3>
          <p className="mb-2">
            Alle Klickpakete sind Prepaid-Pakete. Die Zahlung ist sofort bei Buchung fällig und erfolgt als einmalige Zahlung.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">3.3 Zahlungsmittel</h3>
          <p className="mb-2">
            Folgende Zahlungsmittel werden akzeptiert:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-gray-700">
            <li>Kreditkarte (Visa, Mastercard, American Express)</li>
            <li>SEPA-Lastschrift</li>
            <li>Weitere Zahlungsmittel nach Vereinbarung</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Laufzeit und Gültigkeit der Pakete</h2>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Gültigkeitsdauer</h3>
          <p className="mb-2">
            Alle Prepaid-Klickpakete haben eine Gültigkeit von 12 Monaten ab Kaufdatum. Innerhalb dieser Zeit können
            die erworbenen Klicks frei genutzt werden.
          </p>
          <p className="mb-2">
            Nach Ablauf der 12 Monate verfallen nicht genutzte Klicks automatisch. Eine automatische Verlängerung
            findet nicht statt.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">4.2 Produktsichtbarkeit</h3>
          <p className="mb-2">
            Ohne aktives Klick-Paket oder wenn das Paket abgelaufen ist, sind die Produkte des Händlers nicht
            öffentlich sichtbar. Bei Erwerb eines neuen Pakets werden die Produkte automatisch wieder sichtbar.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">4.3 Erstattung</h3>
          <p className="mb-2">
            Prepaid-Pakete sind Einmalkäufe. Eine Rückerstattung bereits gezahlter Entgelte oder nicht genutzter Klicks
            erfolgt grundsätzlich nicht, es sei denn, die Beendigung erfolgt aus einem vom Betreiber zu vertretenden Grund.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Zusatzleistungen</h2>
          <p className="mb-4">
            Folgende Zusatzleistungen können individuell gebucht werden:
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <h4 className="font-semibold text-gray-900 mb-1">Premium-Platzierung</h4>
            <p className="text-sm text-gray-600">Preis auf Anfrage</p>
            <p className="text-gray-700 mt-2">
              Ihre Produkte werden bevorzugt in Suchergebnissen und auf der Startseite angezeigt.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <h4 className="font-semibold text-gray-900 mb-1">Featured Händler</h4>
            <p className="text-sm text-gray-600">Preis auf Anfrage</p>
            <p className="text-gray-700 mt-2">
              Ihr Shop wird als empfohlener Händler hervorgehoben.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <h4 className="font-semibold text-gray-900 mb-1">Individuelle Beratung</h4>
            <p className="text-sm text-gray-600">Preis auf Anfrage</p>
            <p className="text-gray-700 mt-2">
              Persönliche Beratung zur Optimierung Ihrer Produktpräsentation und Verkaufsstrategie.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Kontakt für Anfragen</h2>
          <p className="mb-2">
            Für Fragen zu Paketen, Preisen oder individuellen Angeboten kontaktieren Sie uns bitte:
          </p>
          <div className="bg-vintage-primary bg-opacity-10 rounded-lg p-4 mt-3">
            <p className="text-gray-900">
              <strong>E-Mail:</strong> <a href="mailto:support@vintagefindr.com" className="text-vintage-primary hover:underline">support@vintagefindr.com</a>
            </p>
          </div>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Stand: Januar 2025<br/>
          Dieses Preis- und Leistungsverzeichnis ist Bestandteil der <a href="/agb" className="text-vintage-primary hover:underline">Allgemeinen Geschäftsbedingungen</a>.
        </p>
      </div>
    </div>
  )
}
