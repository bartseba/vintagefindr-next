export interface BreadcrumbSegment {
  label: string
  href: string
}

/**
 * `fullPath` looks like `vintage/pullover` or `vintage/oberteile/fleece/
 * hoodies` — no separate "short breadcrumb label" exists in the CMS data,
 * so each segment's own URL slug (capitalized) is used directly rather
 * than a full descriptive title. Shared by both category/brand pages
 * (`vintage/[...slug]/page.tsx`) and content pages (`HubContentPageView`)
 * so their breadcrumbs are built identically.
 *
 * Kept in a plain module (no `'use client'`) so Server Components can call
 * it directly — `CategoryHero.tsx` needs `'use client'` for `useStats()`,
 * and a Server Component can't call a function exported from a client module.
 */
export function buildBreadcrumb(fullPath: string): BreadcrumbSegment[] {
  const segments = fullPath.split('/').slice(1)
  const crumbs: BreadcrumbSegment[] = [
    { label: 'Start', href: '/' },
    { label: 'Kleidung', href: '/vintage' },
  ]
  let acc = 'vintage'
  for (const segment of segments) {
    acc += `/${segment}`
    const label = segment.replace(/-/g, ' ')
    crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: `/${acc}` })
  }
  return crumbs
}
