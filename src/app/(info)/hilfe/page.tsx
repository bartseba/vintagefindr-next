import type { Metadata } from 'next'
import Link from 'next/link'
import { HelpCircle, Mail, Search, Store } from 'lucide-react'
import { getFaqBlockById, type FAQ } from '@/lib/directus'
import { sanitizeHTML } from '@/lib/sanitize'
import { HilfeFaqList } from '@/components/HilfeFaqList'
import { companyName, kontaktmail, infoRoutes, routes, siteUrl } from '@/constant/routes'

export const metadata: Metadata = {
  title: 'Hilfe & Support – Häufige Fragen rund um VintageFindr',
  description:
    'Antworten auf häufige Fragen zu Favoriten, Kaufprozess, Versand und mehr. Der VintageFindr Support hilft dir außerdem direkt per E-Mail weiter.',
  robots: 'index, follow',
  alternates: { canonical: `${siteUrl}/hilfe` },
}

// Fallback FAQ data if Directus is not available
const fallbackFaqData: FAQ[] = [
  {
    id: 1,
    question: 'Wie kann ich ein Produkt zu meinen Favoriten hinzufügen?',
    answer: 'Klicken Sie einfach auf das Herz-Symbol bei jedem Produkt. Sie müssen angemelgt sein, um Favoriten zu speichern.',
    sort: 1,
    status: 'published'
  },
  {
    id: 2,
    question: 'Wie funktioniert der Kaufprozess?',
    answer: `${companyName} ist ein Marktplatz. Wenn Sie auf "Zur Händlerseite" klicken, werden Sie zum ursprünglichen Shop weitergeleitet, wo Sie den Kauf abschließen können.`,
    sort: 2,
    status: 'published'
  },
  {
    id: 3,
    question: 'Wer ist für die Produkte verantwortlich?',
    answer: 'Die Händler sind selbst für ihre Angebote und Produktbeschreibungen verantwortlich. VintageFindr vermittelt lediglich zwischen Käufer:innen und Händler:innen.',
    sort: 3,
    status: 'published'
  },
  {
    id: 4,
    question: 'Kann ich als Händler meine Produkte hier verkaufen?',
    answer: 'Ja! Registrieren Sie sich als Vendor und nach der Genehmigung können Sie Ihre Produkte auf unserer Plattform präsentieren.',
    sort: 4,
    status: 'published'
  },
  {
    id: 5,
    question: 'Wie kann ich mein Passwort zurücksetzen?',
    answer: 'Klicken Sie auf der Login-Seite auf "Passwort vergessen" und folgen Sie den Anweisungen in der E-Mail.',
    sort: 5,
    status: 'published'
  },
  {
    id: 6,
    question: 'Gibt es eine mobile App?',
    answer: `Derzeit ist ${companyName} als responsive Webseite verfügbar. Eine mobile App ist in Planung.`,
    sort: 6,
    status: 'published'
  }
]

// "Häufig gestellte Fragen" FaqBlock in Directus
const HILFE_FAQ_BLOCK_ID = 4

export default async function HilfePage() {
  const faqs = await getFaqBlockById(HILFE_FAQ_BLOCK_ID)
  const faqData = faqs.length > 0 ? faqs : fallbackFaqData
  const safeFaqs = faqData.map((faq) => ({ id: faq.id, question: faq.question, safeAnswer: sanitizeHTML(faq.answer) }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-vintage-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hilfe & Support
        </h1>
        <p className="text-xl text-gray-600">
          Wir helfen Ihnen gerne weiter. Finden Sie Antworten auf häufige Fragen oder kontaktieren Sie uns direkt.
        </p>
      </div>
      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 items-center">
        <Link href={routes.vintage}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-vintage-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Produkte finden</h3>
            <p className="text-gray-600 text-sm">
              Nutzen Sie unsere erweiterte Suche und Filter, um genau das zu finden, was Sie suchen.
            </p>
          </div>
        </Link>
        <Link href={infoRoutes.partnerWerden}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-vintage-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner werden</h3>
            <p className="text-gray-600 text-sm">
              Registrieren Sie sich als Händler und präsentieren Sie Ihre Vintage-Kollektion.
            </p>
          </div>
        </Link>
      </div>
      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Häufig gestellte Fragen</h2>
        <HilfeFaqList faqs={safeFaqs} />
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontakt aufnehmen</h2>

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
        <Link
          href="/kontakt"
          className="mt-8 text-sm inline-flex items-center gap-2 px-3 py-3 bg-vintage-primary hover:bg-vintage-hover text-white font-semibold rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <Mail className="w-5 h-5" />
          Zum Kontaktformular
        </Link><br />
      </div>
    </div>
  )
}
