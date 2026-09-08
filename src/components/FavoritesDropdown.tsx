'use client'

import { Heart, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface FavoriteProduct {
  id: string
  title: string
  brand?: string
  price: number
  currency: string
  imageUrl?: string
  vendorName: string
  productUrl?: string
}

interface FavoritesDropdownProps {
  favorites: FavoriteProduct[]
  isOpen: boolean
  onClose: () => void
  onRemoveFavorite: (productId: string) => void
}

export function FavoritesDropdown({
  favorites,
  isOpen,
  onClose,
  onRemoveFavorite
}: FavoritesDropdownProps) {
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (!target.closest('.favorites-dropdown')) {
          onClose()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="favorites-dropdown absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-scale-in">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Meine Favoriten</h3>
          <span className="text-sm text-gray-500">{favorites.length} Artikel</span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {favorites && favorites.length > 0 ? (
          <div className="py-2">
            {favorites.slice(0, 5).map((product) => (
              <div key={product.id} className="px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
                      <img
                        src={`${product.imageUrl}?class=thumbnail`}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 font-medium text-sm">
                          {product?.brand ? product.brand.charAt(0) : 'V'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-sm">
                      {product?.title || 'Unbekanntes Produkt'}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-600">
                          {product?.currency === 'EUR' ? '€' : product?.currency || 'EUR'}{product?.price || 0}
                        </p>
                        <p className="text-xs text-gray-500">inkl. MwSt.</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate ml-2">
                        {product?.vendorName || 'Unbekannt'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {product?.id && (
                      <a
                        href={`/go/${product.id}`}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                        title="Zum Produkt"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => product?.id && onRemoveFavorite(product.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Aus Favoriten entfernen"
                    >
                      <Heart size={14} className="fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {favorites && favorites.length > 5 && (
              <div className="px-4 py-2 text-center border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">
                  +{favorites.length - 5} weitere Favoriten
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm mb-1">Noch keine Favoriten</p>
            <p className="text-gray-400 text-xs">
              Klicken Sie auf das Herz-Symbol bei Produkten
            </p>
          </div>
        )}
      </div>

      {favorites && favorites.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Link
            href="/favorites"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-vintage-primary hover:text-vintage-secondary transition-colors"
          >
            Alle Favoriten anzeigen
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
