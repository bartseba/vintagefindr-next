'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFavoritesQuery, type FavoriteProduct } from '@/hooks/useFavoritesQuery'
import { FavoritesDropdown } from './FavoritesDropdown'

interface FavoritesButtonProps {
  initialFavorites?: FavoriteProduct[]
  userId?: string
}

export function FavoritesButton({ initialFavorites = [], userId }: FavoritesButtonProps) {
  const {
    favorites,
    removeFavorite,
    favoriteCount,
    setFavorites
  } = useFavoritesQuery({
    isAuthenticated: !!userId,
    initialData: initialFavorites?.length > 0 ? initialFavorites : undefined
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Initialize favorites from server data (only if not already set via initialData)
  useEffect(() => {
    if (userId && initialFavorites && initialFavorites.length > 0) {
      setFavorites(initialFavorites)
    } else if (!userId) {
      // Clear favorites if no user
      setFavorites([])
    }
  }, [initialFavorites, userId, setFavorites])

  const handleRemoveFavorite = (productId: string) => {
    removeFavorite(productId)
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (userId && favorites.length > 0) {
      setTimeout(() => {
        if (isHovering) {
          setIsDropdownOpen(true)
        }
      }, 300) // Small delay to prevent accidental opens
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setTimeout(() => {
      if (!isHovering) {
        setIsDropdownOpen(false)
      }
    }, 100) // Small delay to allow moving to dropdown
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label={favoriteCount > 0 ? `Favoriten anzeigen (${favoriteCount} ${favoriteCount === 1 ? 'Artikel' : 'Artikel'})` : 'Favoriten anzeigen'}
        className="group flex h-8 w-8 sm:h-[56px] sm:w-[56px] items-center justify-center rounded-md text-vintage-secondary hover:bg-transparent hover:bg-vintage-primary hover:text-white transition-colors"
      >
        <span className="relative block">
          <Heart
            className={`${favoriteCount > 0 && 'fill-vintage-primary text-vintage-primary'} h-6 w-6 lg:h-[35px] lg:w-[35px] group-hover:fill-white group-hover:text-vintage-primary  rounded-md p-1 transition-all`}
          />
          {favoriteCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-vintage-primary text-white text-xs font-bold border-2 border-white rounded-full flex items-center justify-center">
              {favoriteCount > 99 ? '99+' : favoriteCount}
            </span>
          )}
        </span>
      </button>

      <FavoritesDropdown
        favorites={favorites}
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onRemoveFavorite={handleRemoveFavorite}
      />
    </div>
  )
}
