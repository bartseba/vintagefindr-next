import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Hero from '@/components/HeroSection'
import SectionHeader from '@/components/SectionHeader'
import { HomeCollectionsGrid } from '@/components/HomeCollectionsGrid'
import { HomeSearchOverlay } from '@/components/HomeSearchOverlay'
import RatgeberHeroSection from '@/components/RatgeberHeroSection'
import { ProductCard } from '@/components/ProductCard'
import { HorizontalCarousel } from '@/components/HorizontalCarousel'
import { EmptyState } from '@/components/ui/EmptyState'
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
import { getCollectionById, getLatestProducts, type LatestProduct } from '@/lib/supabase/public'
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

function ProductCarousel({ title, subtitle, products }: { title: string; subtitle: string; products: LatestProduct[] }) {
  return (
    <>
      <SectionHeader showAll={routes.newDrop} title={title} subtitle={subtitle} />
      {products.length >= 1 ? (
        <HorizontalCarousel title="">
          {products.map((product, index) => (
            <div key={product.id} className="">
              <ProductCard
                id={product.id}
                vendorId={product.vendorId}
                title={product.title}
                brand={product.brand}
                category={product.category}
                price={product.price}
                currency={product.currency}
                era={product.vintage_styles}
                imageUrl={product.imageUrl}
                vendorName={product.vendorName}
                productUrl={product.productUrl}
                checkoutUrl={product.checkoutUrl}
                index={index}
              />
            </div>
          ))}
        </HorizontalCarousel>
      ) : (
        <EmptyState
          onResetFilters={() => {/* URL-Filter löschen */ }}
          onCreateAlert={() => {/* Saved Search / E-Mail-Alert öffnen */ }}
          linkHref="/ratgeber"
          linkText="Zum Ratgeber"
          title={`Keine Vintage Drops aktuell verfügbar`}
        />
      )}
    </>
  )
}

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
    products: LatestProduct[]
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
      return <ProductCarousel title="Neueste Vintage Kleidung" subtitle="Neusten Produkte aus verschiedenen Vintage Shops" products={data.products} />
    case 'popular_products':
      return <ProductCarousel title="Beliebte Vintage Kleidung" subtitle="Beliebte Produkte aus verschiedenen Vintage Shops" products={data.products} />
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
      return <ProductSliderBlock title={section.title} query={section.query} />
    default:
      return null
  }
}

export default async function HomePage() {
  const [highlightSection, productHighlightSlider, products, adidasCollection, nikeCollection, oberteilCollection, highlightCategories, homepageSections] = await Promise.all([
    getHighlightSectionBySlug('ratgeber'),
    getProductHighlightSlider(),
    getLatestProducts(),
    getCollectionById('adidas'),
    getCollectionById('vintage-nike'),
    getCollectionById('vintage-oberteile'),
    getHighlightCategories(),
    getHomepageSections(),
  ])

  const sectionData = { highlightSection, productHighlightSlider, products, adidasCollection, nikeCollection, oberteilCollection, highlightCategories }

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
              <div key={section.id} className={` mt-12  mb-12 py-4 ${section.hasBackground ? 'bg-vintage-silverGray border-t border-b border-gray-50' : 'bg-white'}`}>
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
