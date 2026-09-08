'use client'

import { useEffect } from 'react'
import { useFavoritesQuery, type FavoriteProduct } from '@/hooks/useFavoritesQuery'

/**
 * Ported from the `useEffect(() => { if (favorites.length > 0) setFavorites(favorites) }, ...)`
 * block repeated across `dashboard.tsx`, `_info.favorites.tsx`,
 * `ratgeber._index.tsx`, `_index.tsx`, `vintage.tsx` in Remix — syncs a
 * page's server-fetched favorites into the shared Zustand/React Query
 * favorites store. Renders nothing; mount once per page that needs it.
 */
export function FavoritesStoreSync({ favorites }: { favorites: FavoriteProduct[] }) {
  const { setFavorites } = useFavoritesQuery({})

  useEffect(() => {
    if (favorites.length > 0) {
      setFavorites(favorites)
    }
  }, [favorites, setFavorites])

  return null
}
