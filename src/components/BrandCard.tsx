import Link from 'next/link'
import { sanitizeHTML } from '@/lib/sanitize'
import { searchProductCount } from '@/lib/algolia/search'

interface BrandCardProps {
  title: string
  teaserHtml: string
  filterQuery: string
  badgeCategory?: string | null
  badgeLabel?: string | null
  imageUrl?: string | null
  image_alt?: string
  linkHref?: string
  isPublic: boolean
  priority?: boolean
}

/**
 * Brand-overview card for `/vintage/marken` (and any other `isBrand: "TRUE"`
 * teaser grid) — icon + category badge + title + description + live
 * product count, mirroring the reference design. Non-brand category
 * teasers keep using `HubSection.tsx` unchanged.
 */
export async function BrandCard({
  title,
  teaserHtml,
  filterQuery,
  badgeCategory,
  badgeLabel,
  imageUrl,
  image_alt,
  linkHref,
  isPublic,
  priority = false,
}: BrandCardProps) {
  if (!isPublic) return null

  const safeHTML = sanitizeHTML(teaserHtml)
  const count = filterQuery ? await searchProductCount(filterQuery) : 0
  const roundedCount = Math.floor(count / 10) * 10
  const badge = [badgeCategory, badgeLabel].filter(Boolean).join(' · ')

  return (
    <section className="border bg-white border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
          <img
            src={imageUrl}
            alt={image_alt ?? title}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            width="48"
            height="48"
          />
        )}
        {badge && (
          <span className="shrink-0 px-3 py-1 rounded-md border border-vintage-primary/20 bg-vintage-primary/10 text-vintage-primary text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>

      <p className="text-xl font-bold text-gray-900 mt-4 uppercase">{title}</p>
      <div
        className="prose prose-sm text-gray-600 text-sm mt-2 max-w-none line-clamp-3 [&_a]:no-underline mb-4"
        dangerouslySetInnerHTML={{ __html: safeHTML }}
      />

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {roundedCount > 0 ? `${roundedCount}+ Pieces verfügbar` : 'Produkte verfügbar'}
        </span>
        {linkHref && (
          <Link href={linkHref} className="text-sm font-semibold text-vintage-primary hover:text-vintage-hover transition-colors shrink-0">
            Entdecken →
          </Link>
        )}
      </div>
    </section>
  )
}
