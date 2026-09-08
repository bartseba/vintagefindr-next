import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import {
  getAllBrandHrefs, getBrandCategoryPage, getBrands, getCategoryPage, getSidebarNavigationItems,
  getNavigationItemByHref, getHubContentPageById, getPopularBrands, type CategoryPage,
} from '@/lib/directus'
import { sanitizeHTML } from '@/lib/sanitize'
import { siteUrl, companyName } from '@/constant/routes'
import { HubContentPageView } from '@/components/HubContentPageView'
import SeoFooter from '@/components/SeoFooter'
import { FaqBlockSection } from '@/components/FaqBlockSection'
import { CategorySearch } from '@/components/algolia/CategorySearch'
import { buildBreadcrumb } from '@/lib/breadcrumb'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

/**
 * Ported from `vintage.$.tsx`'s loader. Also absorbs what `vintage.tsx` (the
 * parent layout) used to compute redundantly for the same URL — that split
 * was the Remix app's `useMatches()` parent-reads-child-loader-data
 * anti-pattern (migration plan problem #2). Next.js layouts and pages don't
 * share loader data that way, and there's no need to: this catch-all page
 * resolves the category/brand page exactly once and renders everything
 * itself, so `vintage/layout.tsx` can stay the dumb Header+children+Footer
 * wrapper it already is.
 */
async function resolveCategoryPage(fullPath: string): Promise<CategoryPage | null> {
  const brandHrefs = await getAllBrandHrefs()
  const pathSegments = fullPath.split('/')
  const containsBrandHref = brandHrefs.some((brandSlug) => pathSegments.includes(brandSlug))

  let categoryPage = await getBrands(fullPath)
  if (containsBrandHref && pathSegments.length > 2) {
    categoryPage = await getBrandCategoryPage(fullPath)
  }
  if (!categoryPage) {
    categoryPage = await getCategoryPage(fullPath)
  }
  return categoryPage
}

async function loadPageData(slug: string[]) {
  const fullPath = `vintage/${slug.join('/')}`

  const navItem = await getNavigationItemByHref(`/${fullPath}`)
  if (navItem?.pageType === 'content_page' && navItem.ContentPage?.id) {
    const hubContentPage = await getHubContentPageById(navItem.ContentPage.id)
    if (hubContentPage) {
      return { type: 'content_page' as const, hubContentPage }
    }
  }

  const categoryPage = await resolveCategoryPage(fullPath)
  if (!categoryPage) return null

  return { type: 'category_page' as const, categoryPage, fullPath }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await loadPageData(slug)
  const pathname = `/vintage/${slug.join('/')}`

  if (!data) {
    return {
      title: `Kategorie nicht gefunden | ${companyName}`,
      description: 'Die angeforderte Kategorie wurde nicht gefunden.',
      alternates: { canonical: `${siteUrl}${pathname}` },
    }
  }

  if (data.type === 'content_page') {
    const { hubContentPage } = data
    const title = hubContentPage.seoTitle ?? hubContentPage.introHeadline ?? companyName
    const description = hubContentPage.seoDescription ?? ''
    return {
      title,
      description,
      alternates: { canonical: `${siteUrl}${pathname}` },
      robots: 'index, follow',
      openGraph: { title, description, type: 'website' },
    }
  }

  const { categoryPage } = data
  const canonical = categoryPage.canonical_url ? `${siteUrl}${categoryPage.canonical_url}` : `${siteUrl}${pathname}`
  return {
    title: categoryPage.seo_title,
    description: categoryPage.seo_description,
    alternates: { canonical },
    robots: 'index, follow',
    openGraph: { title: categoryPage.seo_title, description: categoryPage.seo_description, type: 'website' },
  }
}

export default async function VintageCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const data = await loadPageData(slug)
  if (!data) notFound()

  if (data.type === 'content_page') {
    const fullPath = `vintage/${slug.join('/')}`
    return (
      <HubContentPageView
        hubContentPage={data.hubContentPage}
        breadcrumb={buildBreadcrumb(fullPath)}
      />
    )
  }

  const { categoryPage, fullPath } = data
  const sidebarItems = await getSidebarNavigationItems()
  const popularBrands = await getPopularBrands()
  const defaultSortIndex = fullPath.includes('neuester-drop') ? 'products_new' : undefined
  const seoFooterData = categoryPage.seo_footer ?? categoryPage.seo_brand_footer

  return (
    <>
      <div className="xl:container xl:m-auto xl:px-4 lg:px-0">
        <div className="lg:flex flex-col lg:flex-row gap-6">
          <div className="flex-1 px-4 xl:px-0">
            <CategorySearch
              keyword={categoryPage.keyword?.[0]}
              sidebarItems={sidebarItems}
              user={null}
              userFavorites={[]}
              defaultSortIndex={defaultSortIndex}
              brand={categoryPage.brand}
              altText={categoryPage.altText}
              h1={categoryPage.h1}
              introSafeHtml={categoryPage.intro_html ? sanitizeHTML(categoryPage.intro_html) : undefined}
              breadcrumb={buildBreadcrumb(fullPath)}
              popularBrands={popularBrands}
            />
          </div>
        </div>
      </div>
      {categoryPage.faqBlock && (
        <div className="xl:container xl:m-auto xl:px-4 lg:px-0">
          <FaqBlockSection block={categoryPage.faqBlock} />
        </div>
      )}
      {seoFooterData && <SeoFooter {...seoFooterData} />}
    </>
  )
}
