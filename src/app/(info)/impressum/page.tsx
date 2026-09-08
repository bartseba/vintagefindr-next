import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { companyEmail, companyName } from "@/constant/routes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Ported from app/routes/_info.impressum.tsx (Remix) — Phase 0 proof-of-life
// page: static, no data dependency, verifies layout/Tailwind/font parity.
export default function Impressum() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Impressum
      </h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Angaben gemäß § 5 DDG</h2>
          <p>
            {companyName}<br />
            Sebastian Bartels (Einzelunternehmer)<br />
            Neuer Kamp 1<br />
            20359 Hamburg<br />
            Deutschland<br />
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kontakt</h2>
          <p>
            E-Mail: {companyEmail}<br />
          </p>
          <p className="mt-4 text-gray-600">
            Wir sind über unser Kontaktformular schnell und zuverlässig erreichbar.
          </p>

          <div className="mt-6 flex">
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 bg-vintage-primary hover:bg-vintage-hover text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Mail className="w-5 h-5" />
              Zum Kontaktformular
            </Link>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Wesentliche Merkmale der Dienstleistung</h2>
          <p>
            {companyName} ist eine Aggregatorplattform für Vintage-Mode und Second-Hand-Kleidung.
            Wir ermöglichen die Suche und den Vergleich von Produkten verschiedener unabhängiger Händler.
            Die Produkte werden von den jeweiligen Händlern angeboten.
          </p>
          <p className="mt-4">
            <strong>Wichtig:</strong> Der Kaufvertrag kommt direkt zwischen Ihnen und dem jeweiligen
            Händler zustande. {companyName} ist nicht Vertragspartner und wickelt keine Verkäufe ab.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rechtliche Hinweise</h2>
          <p>
            Weitere rechtliche Informationen finden Sie in unseren folgenden Dokumenten:
          </p>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/agb" className="text-vintage-primary hover:underline font-medium">
                AGB (Allgemeine Geschäftsbedingungen) B2B
              </Link>
            </li>
            <li>
              <Link href="/nutzungsbedingungen" className="text-vintage-primary hover:underline font-medium">
                Nutzungsbedingungen B2C
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="text-vintage-primary hover:underline font-medium">
                Datenschutzerklärung
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verbraucherstreitbeilegung</h2>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  )
}
