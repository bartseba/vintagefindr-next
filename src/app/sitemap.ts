import type { MetadataRoute } from 'next'
import { siteUrl, routes, infoRoutes } from '@/constant/routes'
import { getSitemapVintageUrls, getSitemapGuideUrls, getSitemapGuideCategoryUrls } from '@/lib/directus'

/**
 * No `revalidate`/ISR here: the Directus client (`src/lib/directus.ts`)
 * deliberately sets `cache: 'no-store'` on every request (fixed a real
 * stale-data bug earlier — see that file's `buildClient()` comment), which
 * makes every fetch in this route "dynamic usage" and defeats static
 * generation/ISR outright — Next throws `Dynamic server usage` during the
 * build's prerender attempt if `revalidate` is set here (confirmed via a
 * real build). Matches `/vintage/[...slug]`'s own `force-dynamic` — this
 * route just re-fetches on every request, same as the rest of the CMS-
 * driven site; a sitemap isn't a hot path.
 */
export const dynamic = 'force-dynamic'

/**
 * Curated subset of `infoRoutes` — NOT `Object.values(infoRoutes)`.
 * `infoRoutes.support` ("/support") has no matching page under
 * `src/app/(info)` at all (dead constant, confirmed via `find`).
 * `favorites`/`following` are real routes but auth-gated personal pages
 * (redirect to `/?modal=login` when logged out) — not public content.
 */
const staticInfoPaths = [
  infoRoutes.impressum,
  infoRoutes.datenschutz,
  infoRoutes.agb,
  infoRoutes.nutzungsbedingungen,
  infoRoutes.kontakt,
  infoRoutes.contact,
  infoRoutes.hilfe,
  infoRoutes.partnerWerden,
  infoRoutes.uberUns,
  infoRoutes.unserePartner,
  infoRoutes.preise,
  infoRoutes.jobs,
  infoRoutes.dsaMeldung,
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [routes.home, routes.vintage, routes.ratgeber, ...staticInfoPaths]

  const [vintageUrls, guideUrls, guideCategoryUrls] = await Promise.all([
    getSitemapVintageUrls(),
    getSitemapGuideUrls(),
    getSitemapGuideCategoryUrls(),
  ])

  const allPaths = Array.from(new Set([...staticPaths, ...vintageUrls, ...guideUrls, ...guideCategoryUrls]))

  return allPaths.map((path) => ({ url: `${siteUrl}${path}` }))
}
