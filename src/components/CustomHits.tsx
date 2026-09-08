'use client'

import { useHits, type UseHitsProps } from 'react-instantsearch'
import { useTextStore } from '@/hooks/useTextStore'
import { EmptyStateV2 } from './ui/EmptyStateV2'
import { ProductCard } from './ProductCard'
import type { SidebarNavigationItem } from '@/lib/directus'

interface Hit {
  objectID: string
  id: string
  title: string
  brand?: string
  category?: string
  price: number
  currency: string
  condition?: string
  vintage_styles?: string
  image_url_1?: string
  vendor?: string
  vendor_name?: string
  vendor_id?: string
  product_url?: string
  checkout_url?: string
}

type CustomHitsProps = UseHitsProps<Hit> & {
  userFavorites?: unknown[]
  keyword?: { Name?: string }
  brand?: string
  user?: { id?: string } | null
  viewMode: 'grid' | 'list' | 'masonry'
  altText?: string
  onProductClick?: (productId: string) => void
  sidebarItems?: SidebarNavigationItem[]
}

function HitItem({ item, user, onProductClick }: { item: Hit; user?: { id?: string } | null; onProductClick?: (productId: string) => void }) {
  return (
    <ProductCard
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
      userId={user?.id}
      onProductClick={() => onProductClick?.(item.id)}
    />
  )
}

export function CustomHits({ altText: _altText, user, viewMode, onProductClick, keyword, brand, sidebarItems, ...props }: CustomHitsProps) {
  const { items } = useHits<Hit>(props)
  const searchQuery = useTextStore((state) => state.searchQuery)

  const setText = useTextStore((s) => s.setText)
  const setVendorsCount = useTextStore((s) => s.setVendorsCount)
  const replaceKeyword = (text?: string) => text?.replaceAll('{brand}', brand || '')
  setText(`${items.length}`)

  // Category tiles for the empty state: real sidebar navigation data, not
  // invented — one level of non-brand category groups' children, capped so
  // the tile grid doesn't sprawl.
  const categoryTiles = (sidebarItems ?? [])
    .filter((item) => !item.isBrand)
    .flatMap((item) => (item.children.length > 0 ? item.children : [item]))
    .slice(0, 8)
    .map((item) => ({ label: item.label, href: item.href }))

  // Zähle einzigartige Vendors
  const uniqueVendors = new Set(items.map((item) => item.vendor).filter(Boolean))
  setVendorsCount(uniqueVendors.size)

  return (
    <>
      {items.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto content-start '
              : viewMode === 'masonry'
                ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]'
                : 'space-y-4'
          }
        >
          {items.map((item, idx) => (
            <HitItem
              key={item.objectID || idx}
              item={item}
              user={user}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <EmptyStateV2
          linkHref="/ratgeber"
          linkText="Zum Ratgeber"
          title={searchQuery || replaceKeyword(keyword?.Name) || 'Produkte'}
          categoryTiles={categoryTiles}
        />
      )}
    </>
  )
}
