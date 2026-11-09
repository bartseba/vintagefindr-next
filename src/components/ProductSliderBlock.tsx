import Link from 'next/link'
import { searchProducts } from '@/lib/algolia/search'
import { HubSectionHits } from './HubSectionHits'

type TitleTag = 'h1' | 'h2' | 'h3' | 'p'

interface ProductSliderBlockProps {
  title: string | null
  query: string | null
  titleTag?: TitleTag | null
  /** PRIMARY (default) renders the slider with 12 products; SECONDARY
   * renders a fixed 18-product grid instead. */
  variant?: 'PRIMARY' | 'SECONDARY' | null
  showAllHref?: string
}

/**
 * A single CMS-configured product slider on a `HubContentPage` (see
 * `ProductSliderBlock` in Directus, reorderable via the m2m junction
 * `HubContentPage_ProductSliderBlock`). Mirrors `HubSection.tsx`'s existing
 * `filterQuery` → `searchProducts` → `HubSectionHits` pipeline exactly, so
 * the empty-state behavior (`EmptyState`, not `EmptyStateV2`) matches what's
 * already shown for the category-teaser cards on the same pages.
 */
export async function ProductSliderBlock({ title, query, titleTag, variant, showAllHref }: ProductSliderBlockProps) {
  const isSecondary = variant === 'SECONDARY'
  const hits = query ? await searchProducts(query, isSecondary ? 10 : 12) : []
  const displayTitle = title?.trim() || 'Produkte'
  const Tag = titleTag ?? 'h2'

  return (
    <section>
      {title && (
        <div className="flex items-end justify-between mb-12">
          <Tag className="font-playfair text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{title}</Tag>
          {showAllHref && (
            <Link
              href={showAllHref}
              className="shrink-0 ml-4 text-sm tracking-widest uppercase font-medium align-center text-vintage-secondary hover:text-vintage-primary transition-colors pb-0.5"
            >
              Alle ansehen
            </Link>
          )}
        </div>
      )}
      <HubSectionHits hits={hits} title={displayTitle} layout={isSecondary ? 'grid' : 'slider'} />
    </section>
  )
}
