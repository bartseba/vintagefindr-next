import type { Metadata } from 'next'
import { companyName, siteUrl } from '@/constant/routes'

export const metadata: Metadata = {
  title: 'Karriere bei VintageFindr – Arbeiten im Vintage-Marktplatz',
  description:
    'Aktuell gibt es bei VintageFindr keine offenen Stellen. Schau gern später wieder vorbei oder schreib uns, wenn du Teil unseres Teams werden möchtest.',
  robots: 'index, follow',
  alternates: { canonical: `${siteUrl}/jobs` },
}

export default function Jobs() {
return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Arbeiten bei {companyName}</h1>
        <p className="mt-4 text-lg text-gray-600">
          Werden Sie Teil unseres Teams und helfen Sie dabei, die Zukunft der nachhaltigen Mode zu gestalten.
        </p>
      </header>

      {/* Status */}
      <section aria-labelledby="status" className="mb-10">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <h2 id="status" className="text-xl font-semibold text-gray-900">Aktuell keine offenen Stellen</h2>
          <p className="mt-2 text-gray-700">
            Zurzeit haben wir keine freien Positionen. Schauen Sie später noch einmal vorbei.
          </p>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values" className="mb-10">
        <h2 id="values" className="text-2xl font-bold text-gray-900 mb-4">Wofür wir stehen</h2>
        <ul className="grid sm:grid-cols-2 gap-4">
          {[
            "Sinnstiftende Arbeit rund um langlebige Mode",
            "Respektvolle Zusammenarbeit und klare Kommunikation",
            "Eigenverantwortung, Pragmatismus und kurze Entscheidungswege",
            "Lernen im Alltag: Feedback, Iteration, Verbesserung"
          ].map((item) => (
            <li key={item} className="rounded-xl border border-gray-100 bg-white p-4 text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}