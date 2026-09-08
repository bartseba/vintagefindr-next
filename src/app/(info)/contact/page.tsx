import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { ContactForm } from '@/components/contact/ContactForm'
import { companyName } from '@/constant/routes'

/**
 * Ported from `_info.contact.tsx` — an older/duplicate page alongside
 * `/kontakt`, with its own placeholder business info (address, phone) and
 * a mock form action that never actually sends anything (see actions.ts).
 * Note this page renders its own `<header>` on top of the shared
 * `(info)/layout.tsx` Header — that's the Remix original's actual live
 * behavior too (`_info.contact.tsx` is a child of the pathless `_info.tsx`
 * layout, so both headers stacked there as well), preserved as-is.
 * Noindex: real SEO meta here would only create duplicate content against
 * the working `/kontakt` page and drive search traffic to a form that
 * never actually sends anything.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>Kontakt</span>
              </Link>
            </div>

            <Link href="/" className="text-2xl font-bold text-amber-600">
              {companyName}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kontakt
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Haben Sie Fragen, Anregungen oder benötigen Sie Hilfe? Wir freuen uns auf Ihre Nachricht!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontaktinformationen</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">E-Mail</h3>
                    <p className="text-gray-600">info@vintagefinder.de</p>
                    <p className="text-sm text-gray-500">Antwort innerhalb von 24 Stunden</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefon</h3>
                    <p className="text-gray-600">+49 (0) 30 12345678</p>
                    <p className="text-sm text-gray-500">Mo-Fr 9:00-18:00 Uhr</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                    <p className="text-gray-600">Sofortige Hilfe</p>
                    <p className="text-sm text-gray-500">Mo-Fr 9:00-18:00 Uhr</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">
                      {companyName} GmbH<br/>
                      Musterstraße 123<br/>
                      10115 Berlin<br/>
                      Deutschland
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Öffnungszeiten</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montag - Freitag</span>
                  <span className="font-medium text-gray-900">9:00 - 18:00 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Samstag</span>
                  <span className="font-medium text-gray-900">10:00 - 16:00 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sonntag</span>
                  <span className="font-medium text-gray-900">Geschlossen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nachricht senden</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
