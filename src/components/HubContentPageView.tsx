import Link from 'next/link'
import type { HubContentPage } from '@/lib/directus'
import { sanitizeHTML } from '@/lib/sanitize'
import { HubSection } from './HubSection'
import { HubContentBlock } from './HubContentBlock'
import { ProductSliderBlock } from './ProductSliderBlock'
import { FaqBlockSection } from './FaqBlockSection'
import type { BreadcrumbSegment } from '@/lib/breadcrumb'

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
export function HubContentPageView({ hubContentPage, breadcrumb = [] }: HubContentPageViewProps) {
  const categoryTeaserItems = hubContentPage.categoryTeaserBlock.filter((item) => item.isPublic)
  const productSliderItems = hubContentPage.productSliderBlock.filter((item) => item.isPublic)

  return (
    <div className="asdsad">
      <div className="xl:container mx-auto ">
     

        {(hubContentPage.introHeadline || hubContentPage.introText) && (
          <div className={hubContentPage.imageUrl ? "md:flex md:items-start md:gap-8 justify-between" : ""}>
            <div className="px-4 mb-4 py-4">
               {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-400">
            {breadcrumb.map((segment, index) => (
              <span key={segment.href}>
                {index > 0 && <span className="mx-2">›</span>}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-gray-700">{segment.label}</span>
                ) : (
                  <Link href={segment.href} className="hover:text-vintage-primary">
                    {segment.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
            <div>
              {hubContentPage.introHeadline && (
                <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                  {hubContentPage.introHeadline}
                </h1>
              )}
              {hubContentPage.introText && (
                <div
                  className="prose prose-sm mt-3 max-w-4xl text-gray-600 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(hubContentPage.introText) }}
                />
              )}
            </div>
            </div>
            {hubContentPage.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
              <img
                src={hubContentPage.imageUrl}
                alt={hubContentPage.image_alt ?? hubContentPage.introHeadline ?? hubContentPage.Headline}
                className="mt-4 md:mt-0 w-full md:max-w-[380px] shrink-0 object-cover"
                loading="lazy"
              />
            )}
          </div>
        )}
      </div>
      {productSliderItems.length > 0 && (
        <div className="xl:container mx-auto px-4 space-y-8 my-16">
          {productSliderItems.slice(0, 1).map((item) => (
            <ProductSliderBlock key={item.id} title={item.title} query={item.query} />
          ))}
        </div>
      )}
      {categoryTeaserItems.length > 0 && (
        <div className="mb-16 bg-white py-8 border-t border-b border-gray-200">
          <h2 className="xl:container mx-auto px-4 text-2xl font-semibold text-vintage-secondary uppercase tracking-widest mb-2">
            {hubContentPage.Headline}
          </h2>
          <div className="xl:container mx-auto md:grid md:grid-cols-3 md:gap-6 bg-white p-4">
            {categoryTeaserItems.map((item, index) => (
              <HubSection
                key={item.id}
                title={item.title}
                teaserHtml={item.teaser}
                filterQuery={item.filterQuery}
                showAllLink={item.link?.href ?? ""}
                links={item.links ?? undefined}
                image={item.image}
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
      {productSliderItems.length > 0 && (
        <div className="xl:container mx-auto px-4 mb-16 space-y-8">
          {productSliderItems.slice(1).map((item) => (
            <ProductSliderBlock key={item.id} title={item.title} query={item.query} />
          ))}
        </div>
      )}
      {hubContentPage.content_block.length > 0 && (
        <div className="xl:container mx-auto px-4 mb-4">
          {hubContentPage.content_block.map((item) => (
            <HubContentBlock key={item.id} item={item} />
          ))}
        </div>
      )}
      
      {hubContentPage.faqBlock && <div className="xl:container mx-auto px-4 mb-4"><FaqBlockSection block={hubContentPage.faqBlock} /></div>}
    </div>
  )
}
