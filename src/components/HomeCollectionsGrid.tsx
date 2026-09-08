'use client'

import { useEffect, useState } from 'react'
import { Collection, type CollectionData } from './Collection'

interface HomeCollectionsGridProps {
  adidas: CollectionData | null
  nike: CollectionData | null
  oberteile: CollectionData | null
}

/**
 * Extracted from `app/routes/_index.tsx`'s recently-viewed check
 * (`hasRecentlyViewed`, gates whether the 3rd "oberteile" collection shows,
 * making room for a `RecentlyViewedSection` that's actually commented out
 * in the Remix source — preserved as-is, not resurrecting the dead
 * component). Split into its own Client Component (needs `localStorage` +
 * a `window` event listener) so the homepage itself can stay a Server
 * Component.
 */
export function HomeCollectionsGrid({ adidas, nike, oberteile }: HomeCollectionsGridProps) {
  const [hasRecentlyViewed, setHasRecentlyViewed] = useState(false)

  useEffect(() => {
    const checkRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('recently_viewed_products')
        if (stored) {
          const items = JSON.parse(stored)
          setHasRecentlyViewed(items.length > 0)
        } else {
          setHasRecentlyViewed(false)
        }
      } catch (error) {
        console.error('Error checking recently viewed:', error)
        setHasRecentlyViewed(false)
      }
    }

    checkRecentlyViewed()

    window.addEventListener('recentlyViewedChanged', checkRecentlyViewed)
    return () => window.removeEventListener('recentlyViewedChanged', checkRecentlyViewed)
  }, [])

  return (
    <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4'>
      <Collection data={adidas} />
      <Collection data={nike} />
      {!hasRecentlyViewed && <Collection data={oberteile} />}
    </div>
  )
}
