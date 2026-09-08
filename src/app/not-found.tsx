import type { Metadata } from 'next'
import Link from 'next/link'
import { companyName } from '@/constant/routes'
import { ReloadButton } from '@/components/ReloadButton'

/**
 * Ported from the Remix app's root `ErrorBoundary`'s 404 case
 * (`app/root.tsx`) — that component handled every status code (401/403/404/
 * 500/etc.) in one place since Remix's `ErrorBoundary` replaces the whole
 * document. Next's App Router splits this: `not-found.tsx` (this file)
 * handles only the "no route matched" / explicit `notFound()` case and
 * renders inside the root layout (no own `<html>`/`<body>` needed); a
 * generic runtime-error boundary (`error.tsx`) would be a separate file,
 * not built here since only the 404 page was asked for.
 */
export const metadata: Metadata = {
  title: `Seite nicht gefunden | ${companyName}`,
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="text-6xl font-bold text-gray-200 mb-2">404</div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Seite nicht gefunden
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ReloadButton />

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Zur Startseite
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Wenn das Problem weiterhin besteht, kontaktieren Sie uns bitte unter{' '}
          <a href="mailto:support@vintagefindr.de" className="text-blue-600 hover:underline">
            support@vintagefindr.de
          </a>
        </p>
      </div>
    </div>
  )
}
