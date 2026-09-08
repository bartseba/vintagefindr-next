'use client'

import ButtonPrimary from "./ui/ButtonPrimary";
import Link from "next/link";
import { companyName, footerLinks, infoRoutes } from "@/constant/routes";
import { resetConsent } from "./CookieConsent";
interface FooterProps {
  partner: boolean
  showPrice?: boolean
}
export function Footer({ partner = true, showPrice = true }: FooterProps) {
  return (
    <footer className="text-vintage-secondary">
      <div className="mx-auto xl:container px-3 py-3 text-sm text-vintage-secondary">
        * Mit einem Sternchen gekennzeichnete Bilder wurden mittels KI generiert.
      </div>
      {showPrice && (
      <div className="mx-auto xl:container px-3 py-3 text-sm text-vintage-secondary">
        ** Alle angegebenen Preise sind Endpreise inklusive gesetzlicher Mehrwertsteuer. Versandkosten können je nach Anbieter variieren und werden gesondert ausgewiesen. Maßgeblich sind die Angaben im jeweiligen Onlineshop des Händlers.
      </div>
      )}

      {/* 1) Hellblauer CTA-Streifen (#ECF4FA) */}
      {partner && (
        <section className="bg-white border-t-2 border-gray-100 ">
          <div className="mx-auto xl:container px-4 py-6 md:py-7">
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <p className="text-left text-slate-600 md:text-lg">
                <strong>Werde Partner</strong> erreiche mehr Nutzer für deinen <strong>Vintage- oder Second-Hand-Shop.</strong> <br />Als Plattform bündeln wir Angebote aus vielen Shops und sorgen für zusätzliche Sichtbarkeit deiner Angebote.
              </p>
              <ButtonPrimary variant="SECONDARY" text={"Partner werden"} href={infoRoutes.partnerWerden} />
            </div>
          </div>
        </section>
      )}


      {/* 2) Haupt-Footer (#1B3B6F) */}
      <div className="bg-vintage-primary text-white">
        {/* optionaler dünner Top-Border-Akzent */}
        <div className="mx-auto xl:container px-4 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-2">
              <img loading="lazy" src="/latest-invert.png" alt={`logo ${companyName}`} />
            </div>

            {/* Spalte: Vintagefinder */}
            <nav aria-label={companyName}>
              <h3 className="text-xl font-semibold">
                {companyName}
              </h3>
              <ul className="mt-5 space-y-3 text-slate-100/90">
                <li>
                  <Link href={footerLinks.about} className="hover:underline">
                    Über uns
                  </Link>
                </li>
                <li>
                  <Link href={infoRoutes.partnerWerden} className="hover:underline">
                    Partner werden
                  </Link>
                </li>
                <li>
                  <Link href={footerLinks.partner} className="hover:underline">
                    Unser Partner
                  </Link>
                </li>
                <li>
                  <Link href={footerLinks.help} className="hover:underline">
                    Hilfe
                  </Link>
                </li>
                <li>
                  <Link href={footerLinks.jobs} className="hover:underline">
                    Jobs
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Spalte: Rechtliches */}
            <nav aria-label="Rechtliches">
              <h3 className="text-xl font-semibold">
                Rechtliches
              </h3>
              <ul className="mt-5 space-y-3 text-slate-100/90">
                <li>
                  <Link href={footerLinks.imprint} className="hover:underline font-semibold">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href={infoRoutes.nutzungsbedingungen} className="hover:underline">
                    Nutzungsbedingungen
                  </Link>
                </li>
                <li>
                  <Link href={footerLinks.privacy} className="hover:underline">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <button
                    onClick={resetConsent}
                    className="hover:underline text-left"
                  >
                    Cookie-Einstellungen
                  </button>
                </li>

              </ul>
            </nav>
            <nav aria-label="hilfe support">
              <h3 className="text-xl font-semibold">
                Hilfe & Support
              </h3>
              <ul className="mt-5 space-y-3 text-slate-100/90">
                <li>
                  <Link href={infoRoutes.hilfe} className="hover:underline">
                    Hilfe
                  </Link>
                </li>
                <li>
                  <Link href={footerLinks.contact} className="hover:underline">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/dsa-meldung" className="hover:underline">
                    DSA-Meldung
                  </Link>
                </li>
              </ul>
            </nav>
            {/* Spalte: Social 
            <div>
              <h3 className="text-xl font-semibold">
                Follow us
              </h3>
              <div className="mt-5 flex items-center gap-4">
                {/* Instagram Icon (Outline) 
                <a
                  href="#"
                  aria-label="Instagram"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/80
                             hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                    />
                    <circle cx="12" cy="12" r="3.5" />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                </a>
              </div>
            </div>*/}
          </div>
        </div>

        {/* 4) Copyright-Balken (#5E60CE) */}
        <div className="bg-vintage-primary border-t-4 border-white">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <p className="text-center text-white/95">
              © 2026 {companyName}, Hamburg <Link href="/impressum">Impressum</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
