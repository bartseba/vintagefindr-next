import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { KontaktForm } from '@/components/kontakt/KontaktForm'
import { kontaktmail, companyName, siteUrl } from '@/constant/routes'

export const metadata: Metadata = {
  title: 'Kontakt – Fragen, Anliegen und Support bei VintageFindr',
  description:
    'Fragen zu VintageFindr, einer Bestellung bei einem Händler oder der Plattform? Schreib uns über das Kontaktformular oder per E-Mail, wir melden uns zeitnah.',
  robots: 'index, follow',
  alternates: { canonical: `${siteUrl}/kontakt` },
}

export default function KontaktPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Kontakt
        </h1>
        <p className="text-xl text-gray-600">
          Haben Sie Fragen? Wir sind für Sie da!
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-vintage-primary rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">E-Mail Support</h3>
                <p className="text-gray-600">{kontaktmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gap-8 my-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nachricht senden</h2>
            <KontaktForm />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Häufig gestellte Fragen
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Vielleicht finden Sie die Antwort auf Ihre Frage bereits in unseren FAQs.
          </p>
          <a
            href="/hilfe"
            className="inline-block w-full text-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Zu den FAQs
          </a>
        </div>
      </div>
    </div>
  )
}
