'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ProductCard'
import { useFavoritesQuery } from '@/hooks/useFavoritesQuery'
import { browse } from '@/constant/routes'

export interface FavoriteListItem {
  id: string
  favoriteId: string
  title: string
  brand?: string
  price: number
  currency: string
  condition?: string
  era?: string
  imageUrl?: string
  vendorName: string
  productUrl?: string
}

interface FavoritesViewProps {
  favorites: FavoriteListItem[]
  userId?: string
  totalCount: number
  currentPage: number
  totalPages: number
  search: string
  category: string
}

/**
 * Ported from `_info.favorites.tsx`'s default export. Note the page's own
 * Remix `action` (removing a favorite by `favoriteId` via a `<Form>`
 * submission) was never actually invoked — `handleRemoveFavorite` calls
 * `removeFavorite` from `useFavoritesQuery`, which posts to `/api/favorites`
 * by `productId` instead. That `/api/favorites` route already exists
 * (built in Phase 0/2.1), so no new remove action was ported here — this
 * reuses it, matching what the Remix UI actually did.
 */
export function FavoritesView({ favorites, userId, totalCount: initialTotalCount, currentPage, totalPages, search, category }: FavoritesViewProps) {
  const { removeFavorite } = useFavoritesQuery({
    isAuthenticated: !!userId,
    initialData: favorites,
  })
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [totalCount, setTotalCount] = useState(initialTotalCount)

  const handleRemoveFavorite = (favoriteId: string) => {
    setRemovingIds(prev => new Set(prev).add(favoriteId))

    setTimeout(() => {
      const favorite = favorites.find(f => f.favoriteId === favoriteId)
      if (favorite) {
        removeFavorite(favorite.id)
        setTotalCount(prev => Math.max(0, prev - 1))
      }
    }, 300)
  }

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    params.set('page', String(page))
    return `/favorites?${params.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-vintage-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meine Favoriten</h1>
              <p className="text-gray-600">{totalCount} gespeicherte Produkte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <div
              key={product.id}
              className={`relative group transition-all duration-300 ${
                removingIds.has(product.favoriteId)
                  ? 'opacity-0 scale-95 pointer-events-none'
                  : 'opacity-100 scale-100'
              }`}
            >
              <ProductCard
                id={product.id}
                title={product.title}
                brand={product.brand}
                price={product.price}
                currency={product.currency}
                condition={product.condition}
                era={product.era}
                imageUrl={product.imageUrl}
                vendorName={product.vendorName}
                productUrl={product.productUrl}
                userId={userId}
              />
              <button
                onClick={() => handleRemoveFavorite(product.favoriteId)}
                className="absolute top-3 right-3 w-9 h-9 bg-vintage-primary text-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-vintage-secondary"
                title="Aus Favoriten entfernen"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-vintage-lightGray border-2 border-gray-100  rounded-xl">
          <div className="w-16 h-16 bg-vintage-primary  rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Noch keine Favoriten
          </h3>
          <p className="text-gray-600 mb-6">
            Entdecken Sie Vintage-Produkte und fügen Sie sie zu Ihren Favoriten hinzu
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={browse}>
              <Button>
                Produkte entdecken
              </Button>
            </Link>
            {userId && (
              <Link href="/dashboard">
                <Button variant="outline">
                  Zum Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Link href={buildPageHref(Math.max(1, currentPage - 1))}>
            <Button variant="outline" size="sm" disabled={currentPage === 1}>
              ‹
            </Button>
          </Link>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
            return (
              <Link key={pageNum} href={buildPageHref(pageNum)}>
                <Button
                  variant="outline"
                  size="sm"
                  className={pageNum === currentPage ? 'bg-gray-900 text-white' : ''}
                >
                  {pageNum}
                </Button>
              </Link>
            )
          })}

          <Link href={buildPageHref(Math.min(totalPages, currentPage + 1))}>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
              ›
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
