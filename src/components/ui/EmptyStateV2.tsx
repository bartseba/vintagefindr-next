'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface CategoryTile {
  label: string
  href: string
}

interface EmptyStateV2Props {
  title?: string
  message?: string
  categoryTiles?: CategoryTile[]
  linkHref?: string
  linkText?: string
  className?: string
}

/**
 * Redesign of `EmptyState` (kept as-is, unused for now, not deleted —
 * see conversation). "Kategorie merken" is a visual dummy only: the input
 * is controlled so typing feels real, but submitting does nothing yet —
 * no `onCreateAlert`/API wiring, matches what was explicitly asked for.
 * Category tiles are driven by the caller (real Directus sidebar data,
 * not invented) — no product data or fabricated stats are shown, since
 * the current dataset doesn't reliably back that kind of social proof.
 */
export function EmptyStateV2({
  title = 'Produkte',
  message = 'Unsere Vintage Shops laden mehrmals täglich neue Teile hoch. Wir sagen dir Bescheid, sobald wieder welche reinkommen.',
  categoryTiles = [],
  linkHref,
  linkText = 'Zum Ratgeber',
  className = '',
}: EmptyStateV2Props) {
  const [email, setEmail] = useState('')
  // `title` (e.g. `keyword.Name`) sometimes already starts with "Vintage"
  // (SEO keyword data) — strip it so it doesn't double up with the
  // template's own "Aktuell keine Vintage {title}" wording below.
  const displayTitle = title.replace(/^vintage\s+/i, '')

  return (
    <section aria-live="polite" className={`mb-16 ${className}`}>
      <div className="align-center bg-white rounded-md border border-gray-200  p-6 sm:p-8 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Gerade ausverkauft
          </p>
          <h2 className="mt-2 text-2xl font-bold text-vintage-secondary sm:text-3xl">
            Aktuell keine {displayTitle.includes('Vintage') ? displayTitle : `Vintage ${displayTitle}`} verfügbar
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">
            {message}
          </p>
        </div>
        <div>
        </div>
        {/*
        <div className="mt-6 rounded-md border border-gray-200 bg-vintage-secondary200 p-5 lg:mt-0">
          <h3 className="font-semibold text-vintage-50">Kategorie merken</h3>
          <p className="mt-1 text-sm text-vintage-50">
            Eine Mail, sobald neue Vintage {title} gelistet werden.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@mail.de"
              className="min-w-0 flex-1 rounded-md border placeholder:text-vintage-lightGray border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-vintage-lightGray"
            />
            <button
              type="button"
              className="shrink-0 rounded-md bg-vintage-50 px-4 py-2 text-sm font-semibold text-vintage-secondary hover:bg-vintage-hover"
            >
              Merken
            </button>
          </div>
          <p className="mt-2 text-xs text-vintage-lightGray">Jederzeit abbestellbar.</p>
        </div>*/}
      </div>

      {categoryTiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-vintage-secondary">
            Andere Vintage Kategorien entdecken
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoryTiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-vintage-secondary hover:border-vintage-primary hover:text-vintage-primary"
              >
                {tile.label}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {linkHref && (
        <div className="mt-6 text-center">
          <a
            href={linkHref}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-vintage-secondary underline decoration-2 underline-offset-4 hover:text-vintage-primary"
          >
            {linkText}
            <span className="ml-1" aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </section>
  )
}
