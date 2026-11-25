'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HubSectionHits } from './HubSectionHits'
import type { ProductHit } from '@/lib/algolia/search'
import ButtonPrimary from './ui/ButtonPrimary'

const PILL_BASE = 'h-9 px-4 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 flex items-center shrink-0 border'
const PILL_ACTIVE = 'bg-vintage-primary text-white border-vintage-primary'
const PILL_INACTIVE = 'bg-white text-vintage-secondary vintage-border hover:bg-vintage-primary hover:text-white hover:border-vintage-primary'

interface TabWithHits {
  id: number
  label: string
  hits: ProductHit[]
}

/**
 * Pill-tab filter bar + product grid, driven by hits that are already
 * fetched server-side per tab (see `ProductSliderBlock.tsx`) — switching
 * tabs is pure client-side state, no refetch.
 */
export function ProductTabsGrid({ tabs, showAllHref }: { tabs: TabWithHits[]; showAllHref?: string }) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id)
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]

  if (!activeTab) return null

  return (
    <div>
      <div role="tablist" aria-label="Produktfilter" className="flex gap-2 overflow-x-auto pb-4 -mx-1 px-1 my-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`${PILL_BASE} ${tab.id === activeTab.id ? PILL_ACTIVE : PILL_INACTIVE}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <HubSectionHits hits={activeTab.hits} title={activeTab.label} layout="grid" />
      {showAllHref && (
        <div className="flex justify-center mt-12">
          <ButtonPrimary variant="PRIMARY" text={"Alle ansehen"} href={showAllHref} />
        </div>
      )}
    </div>
  )
}
