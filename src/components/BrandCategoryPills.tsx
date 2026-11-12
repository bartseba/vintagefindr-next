'use client'

import { useState, type ReactNode } from 'react'

const PILL_BASE = 'h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 flex items-center shrink-0 border'
const PILL_ACTIVE = 'bg-vintage-primary text-white border-vintage-primary'
const PILL_INACTIVE = 'bg-white text-vintage-secondary vintage-border hover:bg-vintage-primary hover:text-white hover:border-vintage-primary'

const ALL = 'Alle'

interface BrandCategoryPillsProps {
  items: Array<{ id: number; category: string | null; node: ReactNode }>
}

/**
 * Category pill filter above the `/vintage/marken` brand grid. Cards are
 * already fetched/rendered server-side (incl. their live Algolia counts) —
 * this only toggles which already-rendered `BrandCard` nodes are visible,
 * no refetch on click (same principle as `ProductTabsGrid.tsx`).
 */
export function BrandCategoryPills({ items }: BrandCategoryPillsProps) {
  const categories = Array.from(new Set(items.map((item) => item.category).filter((c): c is string => !!c)))
  const [active, setActive] = useState(ALL)
  const visible = active === ALL ? items : items.filter((item) => item.category === active)

  return (
    <div>
      <div role="tablist" aria-label="Marken-Kategorien" className="flex gap-2 overflow-x-auto pb-6 -mx-1 px-1 justify-center flex-wrap">
        {[ALL, ...categories].map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active === category}
            onClick={() => setActive(category)}
            className={`${PILL_BASE} ${active === category ? PILL_ACTIVE : PILL_INACTIVE}`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {visible.map((item) => (
          <div key={item.id}>{item.node}</div>
        ))}
      </div>
    </div>
  )
}
