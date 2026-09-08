'use client'

import * as React from 'react'
import { Configure } from 'react-instantsearch'
import { InstantSearchNext } from 'react-instantsearch-nextjs'
import { searchClient } from '@/lib/algolia/client'
import { useCategoryState } from '@/hooks/useCategoryState'

export interface SearchProviderProps {
  children?: React.ReactNode
}

/**
 * Consolidated replacement for the Remix app's `SearchClient.tsx` `Search`
 * component. Wraps children in `InstantSearchNext` so nested
 * `<Index>`/`<Configure>` widgets (e.g. inside `HubSection`, or
 * `ProductFilterSlider` on the homepage) have an InstantSearch context to
 * attach to. Built in sub-phase 2.1 against `InstantSearchSSRProvider`+
 * `InstantSearch` (the Remix pattern, since this component was unused
 * until now) — updated to `InstantSearchNext` to match the actual working
 * solution established in sub-phase 2.2, where `getServerState`/
 * `renderToString`/`serverState` were found to be dead in Next.js 16 App
 * Router.
 */
export function SearchProvider({ children }: SearchProviderProps) {
  const route = useCategoryState((s) => s.route)
  return (
    <InstantSearchNext searchClient={searchClient} indexName="products" insights={true}>
      <Configure filters={route?.brand ? `brand:${route.brand}` : ''} />
      {children}
    </InstantSearchNext>
  )
}
