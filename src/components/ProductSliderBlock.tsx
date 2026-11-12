import Link from 'next/link'
import { searchProducts } from '@/lib/algolia/search'
import { HubSectionHits } from './HubSectionHits'
import { ProductTabsGrid } from './ProductTabsGrid'
import ButtonPrimary from './ui/ButtonPrimary'

type TitleTag = 'h1' | 'h2' | 'h3' | 'p'

interface ProductSliderBlockProps {
  title: string | null
  query: string | null
  titleTag?: TitleTag | null
  /** PRIMARY (default) renders the slider with 12 products; SECONDARY
   * renders a fixed 18-product grid instead. */
  variant?: 'PRIMARY' | 'SECONDARY' | null
  showAllHref?: string
  /** Pill filter tabs (Directus `ProductSliderBlockTab`, o2m `tabs`). Only
   * used when variant is SECONDARY; falls back to the single-query grid
   * below when empty, so SECONDARY sliders without tabs are unaffected. */
  tabs?: Array<{ id: number; label: string; query: string }>
}

/**
 * A single CMS-configured product slider on a `HubContentPage` (see
 * `ProductSliderBlock` in Directus, reorderable via the m2m junction
 * `HubContentPage_ProductSliderBlock`). Mirrors `HubSection.tsx`'s existing
 * `filterQuery` → `searchProducts` → `HubSectionHits` pipeline exactly, so
 * the empty-state behavior (`EmptyState`, not `EmptyStateV2`) matches what's
 * already shown for the category-teaser cards on the same pages.
 */
export async function ProductSliderBlock({ title, query, titleTag, variant, showAllHref, tabs = [] }: ProductSliderBlockProps) {
  const isSecondary = variant === 'SECONDARY'
  const displayTitle = title?.trim() || 'Produkte'
  const Tag = titleTag ?? 'h2'

  if (isSecondary && tabs.length > 0) {
    const tabsWithHits = await Promise.all(
      tabs.map(async (tab) => ({ id: tab.id, label: tab.label, hits: await searchProducts(tab.query, 10) }))
    )

    return (
      <section>
        {title && <Tag className={`font-mono text-2xl lg:text-3xl font-bold text-gray-900 leading-tight ${tabs.length > 0 ? 'mb-0' : 'mb-6'}`}>{title}</Tag>}
        <ProductTabsGrid tabs={tabsWithHits} showAllHref={showAllHref} />
      </section>
    )
  }

  const hits = query ? await searchProducts(query, isSecondary ? 10 : 12) : []

  return (
    <section>
      {title && (
        <div className="flex items-end justify-between mb-12">
          <Tag className="font-playfair text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{title}</Tag>
          {showAllHref && (
            <ButtonPrimary variant="SECONDARY" text={" Alle ansehen"} href={showAllHref} />
          )}
        </div>
      )}
      <HubSectionHits hits={hits} title={displayTitle} layout={isSecondary ? 'grid' : 'slider'} />
    </section>
  )
}
