import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { getNavigationItemByHref, getHubContentPageById } from '@/lib/directus'
import { HubContentPageView } from '@/components/HubContentPageView'
import { buildBreadcrumb } from '@/lib/breadcrumb'

/**
 * Ports `vintage._index.tsx`'s `content_page` branch. Confirmed via Directus
 * that `/vintage` resolves as `pageType: content_page` (HubContentPage id 1),
 * so the legacy `hub_content`/`getHubContent()` fallback branch isn't ported.
 */
async function getHubContentPage() {
  const navItem = await getNavigationItemByHref('/vintage')
  if (navItem?.pageType !== 'content_page' || !navItem.ContentPage?.id) {
    return null
  }
  return getHubContentPageById(navItem.ContentPage.id)
}

export async function generateMetadata(): Promise<Metadata> {
  const hubContentPage = await getHubContentPage()
  if (!hubContentPage) return {}

  const title = hubContentPage.seoTitle ?? undefined
  const description = hubContentPage.seoDescription ?? undefined

  return {
    title,
    description,
    alternates: { canonical: '/vintage' },
    robots: 'index, follow',
    openGraph: { title, description, type: 'website' },
  }
}

export default async function VintageHubPage() {
  const hubContentPage = await getHubContentPage()
  if (!hubContentPage) notFound()

  return (
    <HubContentPageView
      hubContentPage={hubContentPage}
      breadcrumb={buildBreadcrumb('vintage')}
    />
  )
}
