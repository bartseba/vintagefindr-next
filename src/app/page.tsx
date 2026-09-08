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
import { getHighlightSectionBySlug, getProductHighlightSlider, getHighlightCategories } from '@/lib/directus'
import { getCollectionById, getLatestProducts } from '@/lib/supabase/public'
import { routes, siteUrl, companyName } from '@/constant/routes'

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

export default async function HomePage() {
  const [highlightSection, productHighlightSlider, products, adidasCollection, nikeCollection, oberteilCollection, highlightCategories] = await Promise.all([
    getHighlightSectionBySlug('ratgeber'),
    getProductHighlightSlider(),
    getLatestProducts(),
    getCollectionById('adidas'),
    getCollectionById('vintage-nike'),
    getCollectionById('vintage-oberteile'),
    getHighlightCategories(),
  ])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HomeSearchOverlay />

        <Hero gridImageSrc="/grid-image.png" />

        {/* Featured Products */}
        <div className="mx-auto py-4 bg-vintage-silverGray ">
          <div className=" xl:container mx-auto px-4 lg:py-0 ">
            <HomeCollectionsGrid adidas={adidasCollection} nike={nikeCollection} oberteile={oberteilCollection} />

            {highlightSection && (
              <RatgeberHeroSection
                featuredGuide={highlightSection.featuredGuide}
                relatedGuides={highlightSection.guides}
              />
            )}
            <SectionHeader showAll={routes.newDrop} title={"Neueste Vintage Drops"} subtitle={"Neusten Produkte aus verschiedenen Vintage Shops"} />
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
          </div>
          {productHighlightSlider && (
            <SearchProvider>
              <ProductFilterSlider
                indexId={productHighlightSlider.index_id}
                subHeadline={productHighlightSlider.subtitle}
                showAll={productHighlightSlider.cta_showall}
                headline={productHighlightSlider.title}
                emptyTitle={productHighlightSlider.emptyTitle}
                query={productHighlightSlider.query}
              />
            </SearchProvider>
          )}
          <HighlightCategories categories={highlightCategories} />
          <BrandLogoSection />
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
