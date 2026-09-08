import type { Metadata } from 'next'
import { companyName, siteUrl } from '@/constant/routes'

export const metadata: Metadata = {
  title: 'Über VintageFindr – Unsere Geschichte und unsere Mission',
  description:
    'VintageFindr bringt Vintage-Fans mit unabhängigen Second-Hand-Händlern zusammen und macht Vintage-Mode leichter auffindbar für bewussten Konsum.',
  robots: 'index, follow',
  alternates: { canonical: `${siteUrl}/ueber-uns` },
}

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Über {companyName}
        </h1>
      </div>

      {/* Story Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-16">
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            {companyName} verbindet Vintage-Fans mit ausgewählten Händler:innen auf einer unabhängigen Plattform. Unser Ziel ist es, Vintage-Mode leichter auffindbar zu machen und bewussten Konsum zu unterstützen.

          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            Die Idee zu {companyName} entstand aus einem einfachen Problem: Gute Vintage-Stücke zu finden kostet oft Zeit. Statt endlosem Suchen gibt es bei uns einen zentralen Ort, an dem neue Vintage-Drops übersichtlich entdeckt werden können. Dafür bündeln wir Angebote aus einer stetig wachsenden Auswahl an Shops.

          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            Parallel entwickeln wir Funktionen, die das Finden, Vergleichen und Entdecken von Vintage-Mode noch einfacher machen.
          </p>
        </div>
      </div>
    </div>
  )
}




