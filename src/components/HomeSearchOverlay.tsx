'use client'

import { useTextStore } from '@/hooks/useTextStore'
import { SimpleSearchOverlay } from './SimpleSearchOverlay'

/**
 * Reads the global `isSearchOpen` store state so the homepage (a Server
 * Component) doesn't need to — mirrors how `CategorySearch.tsx` (2.2)
 * reads the same store internally rather than taking it as a prop.
 */
export function HomeSearchOverlay() {
  const isSearchOpen = useTextStore((state) => state.isSearchOpen)
  const setIsSearchOpen = useTextStore((state) => state.setIsSearchOpen)

  return <SimpleSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
}
