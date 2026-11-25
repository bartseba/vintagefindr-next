import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Hero from '@/components/HeroSection'
import { HomeCollectionsGrid } from '@/components/HomeCollectionsGrid'
import { HomeSearchOverlay } from '@/components/HomeSearchOverlay'
import RatgeberHeroSection from '@/components/RatgeberHeroSection'
import { SearchProvider } from '@/components/algolia/SearchProvider'
import ProductFilterSlider from '@/components/algolia/ProductFilterSlider'
import HighlightCategories from '@/components/HighlightCategory'
import BrandLogoSection from '@/components/seo/BrandLogoSection'
import SeoFooter from '@/components/seo/SeoFooter'
import { LoginSuccessToast } from '@/components/LoginSuccessToast'
import { ProductSliderBlock } from '@/components/ProductSliderBlock'
import {
  getHighlightSectionBySlug,
  getProductHighlightSlider,
  getHighlightCategories,
  getHomepageSections,
  type HomepageSectionType,
  type HomepageSectionItem,
} from '@/lib/directus'
import { getCollectionById } from '@/lib/supabase/public'
import { routes, siteUrl, companyName } from '@/constant/routes'

/**
 * Sections mit eigenem `xl:container`-Wrapper (ProductFilterSlider,
 * HighlightCategories, BrandLogoSection) brauchen keinen zusätzlichen
 * Container von außen — alle anderen schon.
 */
const CONTAINERIZED_TYPES: HomepageSectionType[] = [
  'collections_grid',
  'ratgeber_highlight',
  'latest_products',
  'popular_products',
  'product_slider',
]

const title = `Finde Vintage Mode & Second Hand Kleidung | ${companyName}`
const description =
  'Vintage Mode & Second Hand Kleidung aus Vintage Shops entdecken. Finde Jacken, Jeans, Hoodies, Sneaker, Streetwear und Retro Kleidung auf VintageFindr.'

export const metadata: Metadata = {
  title,
  description,
  robots: 'index, follow',
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: companyName,
    url: `${siteUrl}/`,
  },
}

function renderHomepageSection(
  section: HomepageSectionItem,
  data: {
    highlightSection: Awaited<ReturnType<typeof getHighlightSectionBySlug>>
    productHighlightSlider: Awaited<ReturnType<typeof getProductHighlightSlider>>
    adidasCollection: Awaited<ReturnType<typeof getCollectionById>>
    nikeCollection: Awaited<ReturnType<typeof getCollectionById>>
    oberteilCollection: Awaited<ReturnType<typeof getCollectionById>>
    highlightCategories: Awaited<ReturnType<typeof getHighlightCategories>>
  }
) {

  switch (section.type) {
    case 'collections_grid':
      return <HomeCollectionsGrid adidas={data.adidasCollection} nike={data.nikeCollection} oberteile={data.oberteilCollection} />
    case 'ratgeber_highlight':
      return data.highlightSection ? (
        <RatgeberHeroSection
          featuredGuide={data.highlightSection.featuredGuide}
          relatedGuides={data.highlightSection.guides}
        />
      ) : null
    case 'latest_products':
      return (
        <ProductSliderBlock
          title={section.title ?? 'Neueste Vintage Kleidung'}
          query={section.query}
          titleTag={section.titleTag}
          variant={section.variant}
          tabs={section.tabs}
          showAllHref={section.showAllHref ?? routes.newDrop}
          indexName="products_new"
          source={section.source}
          supabaseField={section.supabaseField}
        />
      )
    case 'popular_products':
      return (
        <ProductSliderBlock
          title={section.title ?? 'Beliebte Vintage Kleidung'}
          query={section.query}
          titleTag={section.titleTag}
          variant={section.variant}
          tabs={section.tabs}
          showAllHref={section.showAllHref ?? routes.newDrop}
          source={section.source}
          supabaseField={section.supabaseField}
        />
      )
    case 'algolia_filter_slider':
      return data.productHighlightSlider ? (
        <SearchProvider>
          <ProductFilterSlider
            indexId={data.productHighlightSlider.index_id}
            subHeadline={data.productHighlightSlider.subtitle}
            showAll={data.productHighlightSlider.cta_showall}
            headline={data.productHighlightSlider.title}
            emptyTitle={data.productHighlightSlider.emptyTitle}
            query={data.productHighlightSlider.query}
          />
        </SearchProvider>
      ) : null
    case 'categories':
      return <HighlightCategories categories={data.highlightCategories} />
    case 'brands':
      return <BrandLogoSection />
    case 'product_slider':
      return (
        <ProductSliderBlock
          title={section.title}
          query={section.query}
          titleTag={section.titleTag}
          variant={section.variant}
          tabs={section.tabs}
          showAllHref={section.showAllHref ?? undefined}
          source={section.source}
          supabaseField={section.supabaseField}
        />
      )
    default:
      return null
  }
}

export default async function HomePage() {
  const [highlightSection, productHighlightSlider, adidasCollection, nikeCollection, oberteilCollection, highlightCategories, homepageSections] = await Promise.all([
    getHighlightSectionBySlug('ratgeber'),
    getProductHighlightSlider(),
    getCollectionById('adidas'),
    getCollectionById('vintage-nike'),
    getCollectionById('vintage-oberteile'),
    getHighlightCategories(),
    getHomepageSections(),
  ])

  const sectionData = { highlightSection, productHighlightSlider, adidasCollection, nikeCollection, oberteilCollection, highlightCategories }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HomeSearchOverlay />

        <Hero gridImageSrc="/grid-image.png" />

        {/* Featured Products */}
        <div className="mx-auto py-4">
          {homepageSections.map((section) => {
            const content = renderHomepageSection(section, sectionData)
            if (!content) return null

            return (
              <div key={section.id} className={`  mb-12 py-12 ${section.hasBackground ? 'bg-vintage-silverGray border-t border-b border-gray-50' : 'bg-white'}`}>
                {CONTAINERIZED_TYPES.includes(section.type) ? (
                  <div className="xl:container mx-auto px-4 lg:py-0">{content}</div>
                ) : (
                  content
                )}
              </div>
            )
          })}
          <SeoFooter />
        </div>
      </main>

      <Footer partner={true} />

      <Suspense fallback={null}>
        <LoginSuccessToast />
      </Suspense>
    </div>
  )
}
