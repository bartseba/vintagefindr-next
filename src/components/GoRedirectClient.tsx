'use client'

import { useEffect, useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
import { companyName } from '@/constant/routes'

interface GoRedirectClientProps {
  targetUrl: string
  productTitle: string
  vendorName: string
}

export function GoRedirectClient({ targetUrl, productTitle, vendorName }: GoRedirectClientProps) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 300)
      return () => clearTimeout(timer)
    } else {
      window.location.href = targetUrl
    }
  }, [countdown, targetUrl])

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
            href={targetUrl}
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
