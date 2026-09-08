'use client'

import Link from 'next/link'
import { useStats } from 'react-instantsearch'
import type { BreadcrumbSegment } from '@/lib/breadcrumb'

export type { BreadcrumbSegment } from '@/lib/breadcrumb'

interface CategoryHeroProps {
  h1?: string
  /** Pre-sanitized HTML — sanitize server-side before passing in, `sanitizeHTML` is `server-only`. */
  safeHtml?: string
  breadcrumb: BreadcrumbSegment[]
}

/**
 * Redesign of the old `IntroSection` (kept as-is, unused for now, not
 * deleted). Rendered inside `CategorySearch`'s `InstantSearchNext` tree
 * (not in the Server Component page) specifically so `useStats()` can show
 * a real, live hit count next to the heading — not a fabricated number.
 */
export function CategoryHero({ h1, safeHtml, breadcrumb }: CategoryHeroProps) {
  const { nbHits } = useStats()

  if (!h1 && !safeHtml) return null

  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      {breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-400 mt-4">
          {breadcrumb.map((segment, index) => (
            <span key={segment.href}>
              {index > 0 && <span className="mx-2">›</span>}
              {index === breadcrumb.length - 1 ? (
                <span className="text-gray-700">{segment.label}</span>
              ) : (
                <Link href={segment.href} className="hover:text-vintage-primary">
                  {segment.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          {h1 && (
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {h1}
            </h1>
          )}
          {safeHtml && (
            <div
              className="prose prose-sm mt-3 max-w-4xl text-gray-600"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Aktuell in dieser Kategorie
          </p>
          <p className="text-2xl font-bold text-gray-900">{nbHits} Angebote</p>
        </div>
      </div>
    </div>
  )
}
