'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HorizontalCarousel } from './HorizontalCarousel'

interface RecentlyViewedProduct {
  id: string
  title: string
  brand: string
  category: string
  price: number
  currency: string
  imageUrl: string
  productUrl: string
  checkoutUrl: string | null
  vendorId: string
  vendor: string
  viewedAt: number
}

const STORAGE_KEY = 'recently_viewed_products'
const MAX_ITEMS = 10

export function addToRecentlyViewed(product: Omit<RecentlyViewedProduct, 'viewedAt'>) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    let recentlyViewed: RecentlyViewedProduct[] = stored ? JSON.parse(stored) : []

    const existingIndex = recentlyViewed.findIndex(p => p.id === product.id)

    if (existingIndex > -1) {
      recentlyViewed.splice(existingIndex, 1)
    }

    const newProduct: RecentlyViewedProduct = {
      ...product,
      viewedAt: Date.now()
    }

    recentlyViewed.unshift(newProduct)

    recentlyViewed = recentlyViewed.slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed))

    window.dispatchEvent(new Event('recentlyViewedChanged'))
  } catch (error) {
    console.error('Error saving recently viewed:', error)
  }
}

function clearRecentlyViewed() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('recentlyViewedChanged'))
  } catch (error) {
    console.error('Error clearing recently viewed:', error)
  }
}

export default function RecentlyViewedSection() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([])

  useEffect(() => {
    const loadRecentlyViewed = () => {
      if (typeof window === 'undefined') return

      try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (stored) {
          const items: RecentlyViewedProduct[] = JSON.parse(stored)

          const now = Date.now()
          const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

          const filtered = items.filter(item => item.viewedAt > thirtyDaysAgo)

          if (filtered.length !== items.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
          }

          setRecentlyViewed(filtered)
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error)
      }
    }

    loadRecentlyViewed()

    window.addEventListener('recentlyViewedChanged', loadRecentlyViewed)

    return () => {
      window.removeEventListener('recentlyViewedChanged', loadRecentlyViewed)
    }
  }, [])

  if (recentlyViewed.length <= 2) {
    return null
  }

  const displayProducts = recentlyViewed.slice(0, 4)
  const hasMore = recentlyViewed.length > 4

  return (
    <section className="p-4 sm:p-6 bg-white vintage-border rounded-md relative ">
      <div className="mb-8">
        <h2 className="text-lg uppercase roboto-vintage sm:text-2xl font-extrabold text-vintage-secondary mb-1">
          Zuletzt angesehen
        </h2>
        <p className="text-xs roboto-mono-vintage font-medium  text-vintage-secondary/85 uppercase tracking-wider">
          Deine kürzlich angeschauten Vintage Produkte
        </p>
      </div>

        <HorizontalCarousel
          title=""
        >
          {displayProducts.map((product) => (
            <Link
              key={product.id}
              href={`/go/${product.id}`}
              className="group relative overflow-hidden rounded-lg bg-gray-100 vintage-border"
            >
              <div className="aspect-square">
                <img
                  src={`${product.imageUrl}?class=thumbnail`}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="cursor-pointer absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-xs font-medium uppercase tracking-wide mb-1">
                    {product.brand}
                  </p>
                  <p className="text-sm font-semibold line-clamp-2">
                    {product.title}
                  </p>
                  <div className="text-sm mt-1">
                    <p>{product.currency === 'EUR' ? '€' : product.currency} {product.price}</p>
                    <p className="text-xs opacity-90">inkl. MwSt.</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </HorizontalCarousel>


      {hasMore && (
        <div className="mt-6 text-center lg:hidden">
          <button
            onClick={clearRecentlyViewed}
            className="
              cursor-pointer
              inline-flex items-center justify-center
              px-6 py-3 rounded-lg
              bg-gray-900 text-white
              hover:bg-gray-800
              transition-colors duration-200
              font-medium
            "
          >
            Alle {recentlyViewed.length} Produkte anzeigen
          </button>
        </div>
      )}
    </section>
  )
}
