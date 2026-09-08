import type { Metadata } from 'next'
import Link from 'next/link'
import { Store, Search, CheckCircle2, UserPlus, ArrowRight, Package, ShieldCheck } from 'lucide-react'
import { companyName, siteUrl, vendorOverview } from '@/constant/routes'

export const metadata: Metadata = {
  title: 'Unsere Partner – Vintage-Shops und Händler auf VintageFindr',
  description:
    'Auf VintageFindr präsentieren unabhängige Vintage-Shops ihre Kleidung. Werde Teil unseres Netzwerks aus Second-Hand-Händlern und erreiche neue Kund:innen.',
  robots: 'index, follow',
  alternates: { canonical: `${siteUrl}/unsere-partner` },
}

type Partner = {
  id: string
  name: string
  logoUrl?: string
  url?: string
  location?: string
}

export default function Partners({ partners = [] }: { partners?: Partner[] }) {
  const hasPartners = partners.length > 0

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Unsere Partner</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          <span className="font-semibold">{companyName}</span> bringt Vintage-Händler:innen aus ganz Deutschland zusammen.
          Von Streetwear aus den 80ern und 90ern bis zu Archiv-Stücken – alle Angebote an einem Ort.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-5 w-5 text-gray-900" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-900">Für Käufer:innen</h3>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5" aria-hidden="true" />
              <span>Vintage Shops aus ganz Deutschland auf einen Blick</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5" aria-hidden="true" />
              <span>Teile aus den 80ern, 90ern und 2000ern</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5" aria-hidden="true" />
              <span>Angebote verschiedener Händler vergleichen</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Store className="h-5 w-5 text-gray-900" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-900">Für Händler:innen</h3>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5" aria-hidden="true" />
              <span>Mehr Sichtbarkeit für deinen Shop</span>
            </li>
            <li className="flex items-start gap-3">
              <Package className="mt-1 h-5 w-5" aria-hidden="true" />
              <span>Eigenes Profil mit Produkt-Anbindung</span>
            </li>
            <li className="flex items-start gap-3">
              <UserPlus className="mt-1 h-5 w-5" aria-hidden="true" />
              <span>Neue Kund:innen über {companyName}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Partner Grid or Empty State */}
      {hasPartners ? (
        <div>
          <h3 className="sr-only">Partnerliste</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {partners.map((p) => (
              <li key={p.id} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition">
                <a href={p.url ?? '#'} className="flex flex-col items-center text-center" aria-label={p.name}>
                  <div className="h-16 w-32 flex items-center justify-center overflow-hidden rounded-md bg-gray-50">
                    {p.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logoUrl} alt={p.name} className="max-h-12 object-contain" />
                    ) : (
                      <span className="text-sm text-gray-500">{p.name}</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.location && <p className="text-sm text-gray-500">{p.location}</p>}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center"
          aria-live="polite"
        >
          <p className="text-gray-900 text-lg font-semibold">Bald verfügbar</p>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Wir sprechen gerade mit ersten Shops. Neue Partner erscheinen hier nach und nach.
          </p>
          <div className="mt-6">
            <Link
              href={vendorOverview}
              className="inline-flex items-center gap-2 rounded-xl bg-vintage-primary px-4 py-2 text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Shop anmelden
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
