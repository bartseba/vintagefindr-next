import Link from 'next/link'
import { headers } from 'next/headers'
import type { HubContentPage } from '@/lib/directus'
import { sanitizeHTML } from '@/lib/sanitize'
import { HubSection } from './HubSection'
import { HubContentBlock } from './HubContentBlock'
import { ProductSliderBlock } from './ProductSliderBlock'
import { FaqBlockSection } from './FaqBlockSection'
import { CollapsibleText } from './ui/CollapsibleText'
import { breadcrumbListJsonLd, type BreadcrumbSegment } from '@/lib/breadcrumb'

interface HubContentPageViewProps {
  hubContentPage: HubContentPage
  breadcrumb?: BreadcrumbSegment[]
}

/**
 * Shared between `/vintage` (sub-phase 2.1) and `/vintage/[...slug]`'s
 * `content_page` branch (sub-phase 2.2) — both render the exact same
 * HubContentPage layout. Extracting this avoids duplicating ~70 lines of
 * JSX across the two routes (the Remix app didn't have this problem since
 * `vintage._index.tsx` was the only route rendering it there; here the
 * catch-all route needs the same content_page branch `vintage.$.tsx` had).
 *
 * The hero block (breadcrumb + heading + intro) matches `CategoryHero`'s
 * markup/classes exactly, so brand hub pages (`/vintage/adidas`, etc.) look
 * like category pages — minus the live hit-count stat, which doesn't apply
 * here (this page isn't itself a filtered product listing).
 */
export async function HubContentPageView({ hubContentPage, breadcrumb = [] }: HubContentPageViewProps) {
  const categoryTeaserItems = hubContentPage.categoryTeaserBlock
    .filter((item) => item.isPublic)
    .sort((a, b) => (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0))
  const productSliderItems = hubContentPage.productSliderBlock.filter((item) => item.isPublic)
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <div>
      {breadcrumb.length > 0 && (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd(breadcrumb)) }}
        />
      )}
      <div className="relative h-[260px] overflow-hidden border-b border-gray-50 bg-vintage-darkGray">
        <div className="xl:container mx-auto px-4 py-8 flex items-center gap-2 justify-center relative h-[260px] flex-col">


          {hubContentPage.introHeadline && (
            <h1 className="font-playfair text-[44px] xl:text-[52px] max-w-[450px] size-auto text-white">
              {hubContentPage.introHeadline}
            </h1>
          )}

          {hubContentPage.introText && (
            <div
              className="prose prose-sm mt-3 max-w-4xl text-white hover:prose-a:underline text-center"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(hubContentPage.introText) }}
            />
          )}
          <div className="px-0 mb-2 py-2">
              {breadcrumb.length > 0 && (
                <nav aria-label="Breadcrumb" className="text-sm text-gray-400">
                  {breadcrumb.map((segment, index) => (
                    <span key={segment.href}>
                      {index > 0 && <span className="mx-2">›</span>}
                      {index === breadcrumb.length - 1 ? (
                        <span className="text-vintage-lightGray">{segment.label}</span>
                      ) : (
                        <Link href={segment.href} className="hover:text-vintage-primary">
                          {segment.label}
                        </Link>
                      )}
                    </span>
                  ))}
                </nav>
              )}
            </div>
        </div>
      </div>
      <div className="bg-white">

        <div className="xl:container mx-auto px-4">
          {(hubContentPage.introHeadline || hubContentPage.introText) && (
            <div className={hubContentPage.imageUrl ? "md:flex md:items-start md:gap-8 justify-between" : ""}>

              {/*hubContentPage.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
              <img
                src={hubContentPage.imageUrl}
                alt={hubContentPage.image_alt ?? hubContentPage.introHeadline ?? hubContentPage.Headline}
                className="mt-4 md:mt-0 w-full md:max-w-[380px] shrink-0 object-cover"
                loading="lazy"
              />
            ) */}
            </div>
          )}
        </div>
      </div>
      {productSliderItems.length > 0 && (
        <div className="bg-white">
          <div className="xl:container mx-auto px-4 space-y-8 pb-16 pt-8">
            {productSliderItems.slice(0, 1).map((item) => (
              <ProductSliderBlock
                key={item.id}
                title={item.title}
                query={item.query}
                titleTag={item.titleTag}
                variant={item.variant}
                tabs={item.tabs}
                showAllHref={breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].href : undefined}
              />
            ))}
          </div>
        </div>
      )}
      {categoryTeaserItems.length > 0 && (
        <div className="pb-16 bg-vintage-silverGray py-16 border-t border-b border-gray-200">
          <div className="xl:container mx-auto px-4 text-center mb-10">
            <p className="text-xs text-vintage-secondary/85 uppercase tracking-[0.2em] mb-3">
              Nach Kategorien stöbern
            </p>
            <h2 className="font-playfair text-3xl lg:text-4xl text-gray-900">
              {hubContentPage.Headline}
            </h2>
          </div>
          <div className="xl:container mx-auto grid gap-6 md:grid md:grid-cols-3 md:gap-6 px-4">
            {categoryTeaserItems.map((item, index) => (
              <HubSection
                key={item.id}
                title={item.title}
                teaserHtml={item.teaser}
                filterQuery={item.filterQuery}
                showAllLink={item.link?.href ?? ""}
                links={item.links ?? undefined}
                imageUrl={item.imageUrl}
                image_alt={item.image_alt}
                isBrand={item.isBrand}
                brand={hubContentPage.brand_list}
                variant={item.variant}
                isPublic={item.isPublic}
                priority={index < 2}
              />
            ))}
          </div>
        </div>
      )}
      <div className="bg-white pt-8">
        {productSliderItems.length > 0 && (
          <div className="xl:container mx-auto px-4 mb-16 space-y-8">
            {productSliderItems.slice(1).map((item) => (
              <ProductSliderBlock
                key={item.id}
                title={item.title}
                query={item.query}
                titleTag={item.titleTag}
                variant={item.variant}
                tabs={item.tabs}
                showAllHref={breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].href : undefined}
              />
            ))}
          </div>
        )}
        {(hubContentPage.content_block.length > 0 || hubContentPage.faqBlock) && (
          <div className="xl:container mx-auto px-4 mb-4">
            <div
              className={
                hubContentPage.content_block.length > 0 && hubContentPage.faqBlock
                  ? 'lg:grid lg:grid-cols-2 lg:gap-10 items-start'
                  : ''
              }
            >
              {hubContentPage.content_block.length > 0 && (
                <CollapsibleText collapsedHeight={480}>
                  {hubContentPage.content_block.map((item) => (
                    <HubContentBlock key={item.id} item={item} />
                  ))}
                </CollapsibleText>
              )}
              {hubContentPage.faqBlock && <FaqBlockSection variant={"SECONDARY"} block={hubContentPage.faqBlock} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
