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
}

/**
 * A single CMS-configured product slider on a `HubContentPage` (see
 * `ProductSliderBlock` in Directus, reorderable via the m2m junction
 * `HubContentPage_ProductSliderBlock`). Mirrors `HubSection.tsx`'s existing
 * `filterQuery` → `searchProducts` → `HubSectionHits` pipeline exactly, so
 * the empty-state behavior (`EmptyState`, not `EmptyStateV2`) matches what's
 * already shown for the category-teaser cards on the same pages.
 */
export async function ProductSliderBlock({ title, query, titleTag, variant }: ProductSliderBlockProps) {
  const isSecondary = variant === 'SECONDARY'
  const hits = query ? await searchProducts(query, isSecondary ? 18 : 12) : []
  const displayTitle = title?.trim() || 'Produkte'
  const Tag = titleTag ?? 'p'

  return (
    <section>
      {title && <Tag className="text-xl font-semibold text-gray-900 mb-2"><strong>{title}</strong></Tag>}
      <HubSectionHits hits={hits} title={displayTitle} layout={isSecondary ? 'grid' : 'slider'} />
    </section>
  )
}
