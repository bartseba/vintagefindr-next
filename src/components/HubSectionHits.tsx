'use client'

import { ProductCard } from './ProductCard'
import { HorizontalCarousel } from './HorizontalCarousel'
import { EmptyState } from './ui/EmptyState'
import { addToRecentlyViewed } from './RecentlyViewedSection'
import type { ProductHit } from '@/lib/algolia/search'

/**
 * Renders a hub-page teaser's product list from server-fetched hits (see
 * `src/lib/algolia/search.ts`). Same rendering shape as the Remix app's
 * `HitsCard.tsx` `CustomInfiniteHits` (carousel of `ProductCard`s, or
 * `EmptyState` when there's 0-1 hits), minus the Algolia Insights
 * `sendEvent` call — there's no InstantSearch context here since this
 * doesn't need interactive refinement, just a fixed-filter product list.
 */
export function HubSectionHits({ hits, title }: { hits: ProductHit[]; title: string }) {
  const handleClickout = (item: ProductHit) => {
    if (item.vendor_id && item.product_url) {
      addToRecentlyViewed({
        id: item.id,
        title: item.title,
        brand: item.brand || '',
        category: item.category || '',
        price: item.price,
        currency: item.currency || 'EUR',
        imageUrl: item.image_url_1 || '',
        productUrl: item.product_url,
        checkoutUrl: item.checkout_url || null,
        vendorId: item.vendor_id,
        vendor: item.vendor_name || 'Unknown',
      })
    }
  }

  if (hits.length <= 1) {
    return (
      <EmptyState
        onResetFilters={() => {}}
        onCreateAlert={() => {}}
        linkHref="/ratgeber"
        linkText="Zum Ratgeber"
        title={`Keine ${title} verfügbar`}
      />
    )
  }

  return (
    <HorizontalCarousel title="" showAll="">
      {hits.map((item) => (
        <ProductCard
          key={item.id}
          id={item.id}
          vendorId={item.vendor_id}
          title={item.title}
          brand={item.brand}
          category={item.category}
          price={item.price}
          currency={item.currency || 'EUR'}
          condition={item.condition}
          era={item.vintage_styles}
          imageUrl={item.image_url_1}
          vendorName={item.vendor_name || 'Unknown'}
          productUrl={item.product_url}
          checkoutUrl={item.checkout_url}
          onProductClick={() => handleClickout(item)}
          shipping_cost={item.shipping_cost}
          free_shipping_threshold={item.free_shipping_threshold}
          delivery_time_min_days={item.delivery_time_min_days}
          delivery_time_max_days={item.delivery_time_max_days}
          tax_included={item.tax_included}
          tax_rate={item.tax_rate}
        />
      ))}
    </HorizontalCarousel>
  )
}
