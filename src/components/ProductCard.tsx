'use client'

import { Heart, Info } from 'lucide-react'
import { useState } from 'react'
import { useFavoritesQuery } from '@/hooks/useFavoritesQuery'
import { useImpressionTracking } from '@/hooks/useImpressionTracking'
import { addToRecentlyViewed } from './RecentlyViewedSection'
import { PriceDisplay } from './PriceDisplay'
import { VendorInfoModal } from './VendorInfoModal'

interface ProductCardProps {
  id: string
  vendorId?: string
  title: string
  brand?: string
  category?: string
  price: number
  currency: string
  condition?: string
  era?: string
  imageUrl?: string
  vendorName: string
  productUrl?: string
  checkoutUrl?: string | null
  onClickout?: (productId: string, vendorId: string) => void
  userId?: string
  onProductClick?: (product: {
    id: string
    title: string
    brand?: string
    price: number
    currency: string
    condition?: string
    imageUrl?: string
    vendorName: string
    productUrl?: string
  }) => void
  index?: number
  // PAngV fields
  shipping_cost?: number | null
  free_shipping_threshold?: number | null
  delivery_time_min_days?: number | null
  delivery_time_max_days?: number | null
  tax_included?: boolean | null
  tax_rate?: number | null
}

export function ProductCard({
  id,
  vendorId,
  title,
  brand,
  category,
  price,
  currency,
  condition,
  imageUrl,
  vendorName,
  productUrl,
  checkoutUrl,
  userId,
  index,
  onProductClick,
  shipping_cost,
  free_shipping_threshold,
  delivery_time_min_days,
  delivery_time_max_days,
  tax_included,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showVendorInfo, setShowVendorInfo] = useState(false)
  const { toggleFavorite, isFavorited, isToggling } = useFavoritesQuery({ isAuthenticated: !!userId })

  // DSGVO-compliant impression tracking
  const impressionRef = useImpressionTracking({
    productId: id,
    vendorId: vendorId || '',
    pageType: 'search',
    enabled: !!vendorId
  })

  const favorited = isFavorited(id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!userId) {
      // Open login modal if not authenticated
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('modal', 'login')
      currentUrl.searchParams.set('redirectTo', window.location.pathname)
      window.history.pushState({}, '', currentUrl.toString())
      window.dispatchEvent(new PopStateEvent('popstate'))
      return
    }

    toggleFavorite({
      id,
      title,
      brand,
      price,
      currency,
      imageUrl,
      vendorName,
      productUrl
    })
  }

  const handleProductClick = () => {
    if (vendorId && productUrl) {
      addToRecentlyViewed({
        id,
        title,
        brand: brand || '',
        category: category || '',
        price,
        currency,
        imageUrl: imageUrl || '',
        productUrl,
        checkoutUrl: checkoutUrl ?? null,
        vendorId,
        vendor: vendorName
      })
    }

    if (onProductClick) {
      onProductClick({
        id,
        title,
        brand,
        price,
        currency,
        condition,
        imageUrl,
        vendorName,
        productUrl
      })
    }
  }

  return (
    <a
      ref={impressionRef as React.Ref<HTMLAnchorElement>}
      href={`/go/${id}`}
      target="_blank"
      rel="nofollow sponsored noopener"
      onMouseDown={() => {
        // Use onMouseDown to ensure tracking happens before navigation
        handleProductClick();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }} className="h-full group block bg-white rounded-md vintage-border overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {!imageError && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny/vendor image hosts, next/image adoption deferred (see migration plan problem #7)
          <img
            src={`${imageUrl}?class=productcard`}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading={index !== undefined && index < 5 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 text-slate-600">
            <span className="text-slate-600 font-medium text-lg">
              {brand ? brand.charAt(0).toUpperCase() : 'V'}
            </span>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white disabled:opacity-50"
          disabled={isToggling}
        >
          <Heart
            size={16}
            className={favorited ? 'fill-vintage-primary text-vintage-primary' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {brand && (
          <p className="text-xs text-vintage-secondary tracking-wide">
            {brand}
          </p>
        )}

        <h3 className="text-gray-900 line-clamp-2 text-sm font-semibold leading-tight my-1">
          {title}
        </h3>
        <div className="mt-1">
          <PriceDisplay
            price={price}
            currency={currency}
            shipping_cost={shipping_cost}
            free_shipping_threshold={free_shipping_threshold}
            delivery_time_min_days={delivery_time_min_days}
            delivery_time_max_days={delivery_time_max_days}
            tax_included={tax_included}
            variant="compact"
            vendorName={vendorName}
          />
        </div>

        {/* Button "Zum Shop (externer Link)" */}
        <a
          href={`/go/${id}`}
          target="_blank"
          rel="nofollow sponsored noopener"
          onClick={(e) => {
            e.stopPropagation()
            handleProductClick()
          }}
          className="block w-full mt-3 px-3 py-2 bg-vintage-primary text-white text-sm font-medium rounded-md hover:bg-vintage-hover transition-colors text-center"
        >
          Zum Shop (externer Link)
        </a>

        {/* Link "Händlerinfo" */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowVendorInfo(true)
          }}
          className="w-full text-sm text-vintage-primary hover:underline mt-1.5 justify-center flex"

        >
          <span className=' flex gap-[5px] items-center mt-1'>
           {vendorName}
          <Info className="h-3 w-3" />
                    </span>
        </button>
      </div>

      {/* Vendor Info Modal */}
      {showVendorInfo && (
        <VendorInfoModal
          isOpen={showVendorInfo}
          onClose={() => setShowVendorInfo(false)}
          vendorName={vendorName}
          productId={id}
        />
      )}
    </a>
  )
}
