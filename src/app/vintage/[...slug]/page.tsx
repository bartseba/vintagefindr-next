import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

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
import { buildBreadcrumb, breadcrumbListJsonLd } from '@/lib/breadcrumb'
import { buildCategoryFilter } from '@/lib/algolia/filterConfig'
import { searchProducts } from '@/lib/algolia/search'

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

  const brandHrefs = await getAllBrandHrefs()
  const categoryFilter = buildCategoryFilter(slug, brandHrefs)

  return { type: 'category_page' as const, categoryPage, fullPath, categoryFilter }
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

  const { categoryPage, categoryFilter } = data
  const canonical = categoryPage.canonical_url ? `${siteUrl}${categoryPage.canonical_url}` : `${siteUrl}${pathname}`

  /**
   * Interim mitigation for pages indexed with zero products (root cause is
   * a Shopify-sync reconciliation gap outside this repo, see Nov 2026 SEO
   * audit) — `follow` stays on so internal links/breadcrumbs still get
   * crawled, only the empty listing itself is kept out of the index. Skips
   * the check when there's no category filter (e.g. a brand-root page with
   * no category segments) since emptiness can't be determined that way.
   */
  const hasProducts = categoryFilter ? (await searchProducts(categoryFilter, 1)).length > 0 : true

  return {
    title: categoryPage.seo_title,
    description: categoryPage.seo_description,
    alternates: { canonical },
    robots: hasProducts ? 'index, follow' : 'noindex, follow',
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

  const { categoryPage, fullPath, categoryFilter } = data
  const sidebarItems = await getSidebarNavigationItems()
  const popularBrands = await getPopularBrands()
  const defaultSortIndex = fullPath.includes('neuester-drop') ? 'products_new' : undefined
  const seoFooterData = categoryPage.seo_footer ?? categoryPage.seo_brand_footer
  const breadcrumb = buildBreadcrumb(fullPath)

  /**
   * ItemList, not Product/Offer — VintageFindr is an aggregator, not the
   * merchant of record, so we describe the listing, not sell the items
   * ourselves. `url` points at the vendor's own product_url (comparison-
   * shopping-engine pattern), not `/go/[productId]` — that's our own
   * tracking interstitial, noindex'd, and not a stable per-product target.
   */
  const listedProducts = categoryFilter ? await searchProducts(categoryFilter, 20) : []
  const itemListJsonLd = listedProducts.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: listedProducts
      .filter((p) => p.product_url)
      .map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: p.product_url,
        name: p.title,
        image: p.image_url_1,
      })),
  } : null

  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd(breadcrumb)) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
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
              breadcrumb={breadcrumb}
              popularBrands={popularBrands}
              categoryFilter={categoryFilter}
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
