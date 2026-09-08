import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import {
  getGuideCategories, buildCategoryTree, getGuideCategoryBySlugPath,
  getGuidesByCategory, getGuideBySlug, getRelatedGuides, getCategoryPath,
} from '@/lib/directus'
import { RatgeberShell } from '@/components/ratgeber/RatgeberShell'
import { CategoryView } from '@/components/ratgeber/CategoryView'
import { GuideView } from '@/components/ratgeber/GuideView'
import { siteUrl } from '@/constant/routes'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

/**
 * Ported from `ratgeber.$.tsx`'s loader. Tries guide-by-full-path, then
 * guide-by-last-segment, then category-by-slug-path — matching the Remix
 * priority order exactly.
 */
async function resolvePage(slug: string[]) {
  const segments = slug.filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  const fullPath = segments.join('/')

  let guide = await getGuideBySlug(fullPath)
  if (!guide) {
    guide = await getGuideBySlug(lastSegment)
  }

  if (guide) {
    const [breadcrumbs, relatedGuides] = await Promise.all([
      getCategoryPath(guide.category),
      getRelatedGuides(guide.category, guide.id, 5),
    ])
    return { type: 'guide' as const, guide, breadcrumbs, relatedGuides }
  }

  const category = await getGuideCategoryBySlugPath(segments)
  if (category) {
    const [guides, breadcrumbs] = await Promise.all([
      getGuidesByCategory(category.id),
      getCategoryPath(category.id),
    ])
    return { type: 'category' as const, category, guides, breadcrumbs }
  }

  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await resolvePage(slug)
  const pathname = `/ratgeber/${slug.join('/')}`

  if (!data) {
    return {
      title: 'Seite nicht gefunden | Vintage Ratgeber',
      description: 'Die gesuchte Seite wurde nicht gefunden.',
    }
  }

  if (data.type === 'guide') {
    const { guide } = data
    const title = guide.seo_title || `${guide.title} – Vintage Ratgeber`
    const description = guide.seo_description || `Guide zu ${guide.title}: Hintergründe, Tipps und Beispiele rund um Vintage Mode, Second Hand und nachhaltige, langlebige Kleidung.`
    const keywords = guide.seo_keywords || `Vintage, Second Hand, nachhaltige Mode, ${guide.title}, Vintage Ratgeber, Guide, Pflege, Größen, Marken, 80er, 90er, 2000er`
    const canonicalUrl = `${siteUrl}/ratgeber/${guide.slug}`
    const ogImage = guide.hero_image || 'https://vintagefinder.b-cdn.net/og/vintage-ratgeber-guide.jpg'

    return {
      title,
      description,
      keywords,
      robots: 'index, follow',
      alternates: { canonical: canonicalUrl },
      openGraph: { title, description, type: 'article', url: canonicalUrl, images: [ogImage] },
      twitter: { card: 'summary_large_image', title, description },
    }
  }

  const { category, breadcrumbs } = data
  const parentCategory = breadcrumbs[breadcrumbs.length - 1]
  const title = category.seo_title || parentCategory?.seo_title || `${category.name} | Vintage Ratgeber`
  const description = `Alle Artikel zum Thema ${category.name} im Vintage Ratgeber`

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${pathname}` },
    openGraph: { title, description },
  }
}

export default async function RatgeberCatchAllPage({ params }: PageProps) {
  const { slug } = await params
  const [data, allCategories] = await Promise.all([
    resolvePage(slug),
    getGuideCategories(),
  ])
  if (!data) notFound()

  const categoryTree = buildCategoryTree(allCategories)

  return (
    <RatgeberShell categoryTree={categoryTree} breadcrumbs={data.breadcrumbs}>
      {data.type === 'category' && <CategoryView category={data.category} guides={data.guides} />}
      {data.type === 'guide' && <GuideView guide={data.guide} relatedGuides={data.relatedGuides} />}
    </RatgeberShell>
  )
}
