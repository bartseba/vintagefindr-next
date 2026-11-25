import Link from 'next/link'
import { searchProducts, type ProductHit } from '@/lib/algolia/search'
import { getSupabaseSliderProducts, type SupabaseSliderField, type SupabaseSliderProduct } from '@/lib/supabase/public'
import { HubSectionHits } from './HubSectionHits'
import { ProductTabsGrid } from './ProductTabsGrid'
import ButtonPrimary from './ui/ButtonPrimary'

type TitleTag = 'h1' | 'h2' | 'h3' | 'p'

function toProductHit(row: SupabaseSliderProduct): ProductHit {
  return {
    objectID: row.id,
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    price: row.price,
    currency: row.currency || 'EUR',
    condition: row.condition,
    vintage_styles: row.vintage_styles,
    image_url_1: row.image_url_1,
    vendor_name: row.vendor_store_name,
    vendor_id: row.vendor_id,
    product_url: row.product_url,
    checkout_url: row.checkout_url ?? undefined,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    shipping_cost: row.shipping_cost ?? undefined,
    free_shipping_threshold: row.free_shipping_threshold ?? undefined,
    delivery_time_min_days: row.delivery_time_min_days ?? undefined,
    delivery_time_max_days: row.delivery_time_max_days ?? undefined,
    tax_included: row.tax_included ?? undefined,
    tax_rate: row.tax_rate ?? undefined,
  }
}

async function fetchHits(
  query: string | null,
  limit: number,
  indexName: string | undefined,
  source: 'ALGOLIA' | 'SUPABASE' | null | undefined,
  supabaseField: SupabaseSliderField | null | undefined
): Promise<ProductHit[]> {
  if (source === 'SUPABASE') {
    const rows = await getSupabaseSliderProducts(supabaseField ?? 'NEWEST', query, limit)
    return rows.map(toProductHit)
  }
  return searchProducts(query ?? '', limit, indexName)
}

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
  tabs?: Array<{ id: number; label: string; query: string; supabaseField?: SupabaseSliderField | null }>
  /** Algolia index/replica to query (e.g. a date-sorted replica). Defaults
   * to the base 'products' index when omitted. */
  indexName?: string
  /** Data source for the main slider/grid, and for the tabs branch (each
   * tab then uses its own `supabaseField`). Defaults to ALGOLIA. */
  source?: 'ALGOLIA' | 'SUPABASE' | null
  /** Only meaningful when source is SUPABASE: which column `query` filters
   * on. NEWEST ignores `query` entirely. */
  supabaseField?: SupabaseSliderField | null
}

/**
 * A single CMS-configured product slider on a `HubContentPage` (see
 * `ProductSliderBlock` in Directus, reorderable via the m2m junction
 * `HubContentPage_ProductSliderBlock`). Mirrors `HubSection.tsx`'s existing
 * `filterQuery` → `searchProducts` → `HubSectionHits` pipeline exactly, so
 * the empty-state behavior (`EmptyState`, not `EmptyStateV2`) matches what's
 * already shown for the category-teaser cards on the same pages.
 */
export async function ProductSliderBlock({ title, query, titleTag, variant, showAllHref, tabs = [], indexName, source, supabaseField }: ProductSliderBlockProps) {
  const isSecondary = variant === 'SECONDARY'
  const displayTitle = title?.trim() || 'Produkte'
  const Tag = titleTag ?? 'h2'

  if (isSecondary && tabs.length > 0) {
    const tabsWithHits = await Promise.all(
      tabs.map(async (tab) => ({
        id: tab.id,
        label: tab.label,
        hits: await fetchHits(tab.query, 10, indexName, source, tab.supabaseField),
      }))
    )

    return (
      <section>
        {title && <Tag className={`font-mono text-2xl lg:text-3xl font-bold text-gray-900 leading-tight ${tabs.length > 0 ? 'mb-0' : 'mb-6'}`}>{title}</Tag>}
        <ProductTabsGrid tabs={tabsWithHits} showAllHref={showAllHref} />
      </section>
    )
  }

  const hits = await fetchHits(query, isSecondary ? 10 : 12, indexName, source, supabaseField)

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
