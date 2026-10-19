'use client'

import { useEffect, useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
import { companyName } from '@/constant/routes'

interface GoRedirectClientProps {
  targetUrl: string
  productTitle: string
  vendorName: string
}

/**
 * Affiliate products' `product_url` already IS a complete Awin tracking
 * deeplink (e.g. awin1.com/pclick.php?p=...&a=...&m=...), baked in at
 * import time — see the vendor product feed. Awin's tracking cookie
 * requires prior consent under § 25 TDDDG, so per Awin's own Consent
 * Signals Framework (help.awin.com/developers/docs/consent-framework-for-partners,
 * which explicitly covers product-feed deeplinks, not just cread.php) we
 * append `&cons=1`/`&cons=0` to that existing URL — omitting it makes
 * Awin *assume* consent was already obtained, so it must always be sent
 * explicitly. `cons=1` lets Awin set its cookie and pass a click ID;
 * `cons=0` still redirects the user through but without cookie/click ID.
 * Non-Awin product URLs are passed through unchanged.
 */
function resolveRedirectUrl(targetUrl: string): string {
  let url: URL
  try {
    url = new URL(targetUrl)
  } catch {
    return targetUrl
  }
  if (!url.hostname.endsWith('awin1.com')) return targetUrl

  const hasConsent = localStorage.getItem('awin_consent') === 'accepted'
  url.searchParams.set('cons', hasConsent ? '1' : '0')
  return url.toString()
}

export function GoRedirectClient({ targetUrl, productTitle, vendorName }: GoRedirectClientProps) {
  const [countdown, setCountdown] = useState(3)
  // Starts as targetUrl to match the server-rendered markup exactly, then
  // resolved for real client-side (reads localStorage, so it must happen
  // after mount to avoid a hydration mismatch).
  const [redirectUrl, setRedirectUrl] = useState(targetUrl)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe resolution, ported pattern from CookieConsent's `mounted` flag: reads localStorage, must run client-only after the SSR-matching initial render
    setRedirectUrl(resolveRedirectUrl(targetUrl))
  }, [targetUrl])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 300)
      return () => clearTimeout(timer)
    } else {
      window.location.href = redirectUrl
    }
  }, [countdown, redirectUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-vintage-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Weiterleitung zum Shop
          </h1>

          <p className="text-gray-600 mb-1">
            Du wirst zu <span className="font-semibold text-vintage-secondary">{vendorName}</span> weitergeleitet
          </p>

          <p className="text-sm text-gray-500">
            {productTitle}
          </p>
        </div>

        <div className="mb-6">
          <Loader2 className="w-12 h-12 text-vintage-primary animate-spin mx-auto" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-vintage-primary">
            <span>Weiterleitung in</span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-vintage-primary text-white font-semibold">
              {countdown}
            </span>
            <span>Sekunden</span>
          </div>

          <a
            href={redirectUrl}
            rel="nofollow sponsored noopener"
            target="_blank"
            className="inline-block text-sm text-vintage-primary hover:text-vintage-secondary font-medium underline"
          >
            Direkt zum Shop
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-400">
            Du verlässt jetzt unsere Seite und wirst zu einem externen Shop weitergeleitet.
          </p>
          <p className="text-xs text-gray-400">
            Kauf und Vertrag erfolgen ausschließlich beim Händler.
            Widerruf/Rückgabe und Gewährleistung erfolgen – soweit anwendbar – ausschließlich gegenüber dem Händler.
            {companyName} nimmt keine Widerrufe oder Rücksendungen entgegen. Preise und Verfügbarkeit können abweichen.
          </p>
        </div>
      </div>
    </div>
  )
}
