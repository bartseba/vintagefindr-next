import { searchProducts } from '@/lib/algolia/search'
import { HubSectionHits } from './HubSectionHits'

interface ProductSliderBlockProps {
  title: string | null
  query: string | null
}

/**
 * A single CMS-configured product slider on a `HubContentPage` (see
 * `ProductSliderBlock` in Directus, reorderable via the m2m junction
 * `HubContentPage_ProductSliderBlock`). Mirrors `HubSection.tsx`'s existing
 * `filterQuery` → `searchProducts` → `HubSectionHits` pipeline exactly, so
 * the empty-state behavior (`EmptyState`, not `EmptyStateV2`) matches what's
 * already shown for the category-teaser cards on the same pages.
 */
export async function ProductSliderBlock({ title, query }: ProductSliderBlockProps) {
  const hits = query ? await searchProducts(query, 12) : []
  const displayTitle = title?.trim() || 'Produkte'

  return (
    <section>
      {title && <p className="text-xl font-semibold text-gray-900 mb-2"><strong>{title}</strong></p>}
      <HubSectionHits hits={hits} title={displayTitle} />
    </section>
  )
}
