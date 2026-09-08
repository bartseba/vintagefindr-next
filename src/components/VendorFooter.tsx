import Link from 'next/link'
import { companyName } from '@/constant/routes'

export function VendorFooter() {
  return (
    <footer className="text-slate-900 mt-auto">
      <div className="bg-vintage-primary text-white">
        <div className="mx-auto xl:container px-4 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- static local asset, matches Footer/Logo's existing plain-<img> approach (see migration plan problem #7) */}
              <img src="/latest-invert.png" alt={`logo ${companyName}`} />
            </div>

            <nav aria-label="Vendor">
              <h3 className="text-xl font-semibold">
                Vendor
              </h3>
              <ul className="mt-5 space-y-3 text-slate-100/90">
                <li>
                  <Link href="/vendor/dashboard" className="hover:underline">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/products" className="hover:underline">
                    Produkte
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/products/new" className="hover:underline">
                    Neues Produkt
                  </Link>
                </li>
                <li>
                  <Link href="/vendor/import" className="hover:underline">
                    CSV Import
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Hilfe & Support">
              <h3 className="text-xl font-semibold">
                Hilfe & Support
              </h3>
              <ul className="mt-5 space-y-3 text-slate-100/90">
                <li>
                  <a href="mailto:support@vintagefindr.com" className="hover:underline">
                    Support kontaktieren
                  </a>
                </li>
                <li>
                  <Link href="/preise" className="hover:underline">
                    Preise & Leistungen
                  </Link>
                </li>
                <li>
                  <Link href="/hilfe" className="hover:underline">
                    Hilfe-Center
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Rechtliches">
              <h3 className="text-xl font-semibold">
                Rechtliches
              </h3>
              <ul className="mt-5 space-y-3 text-slate-100/90">
                <li>
                  <Link href="/agb" className="hover:underline">
                    AGB
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="hover:underline">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/impressum" className="hover:underline">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="hover:underline">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="bg-vintage-primary border-t-4 border-white">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <p className="text-center text-white/95">
              © 2025 {companyName}, Hamburg · <Link href="/impressum" className="hover:underline">Impressum</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
