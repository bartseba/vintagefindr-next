import Link from 'next/link'
import { sanitizeHTML } from '@/lib/sanitize'
import { searchProducts } from '@/lib/algolia/search'
import { HubSectionHits } from './HubSectionHits'

// Duplicated from VintageSidebar.tsx (not yet ported — sub-phase 2.2) rather
// than pulling that whole component in early; consolidate when it lands.
const PILL_BASE_SMALL = 'h-[20px] px-4 py-4 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 leading-[14px] flex items-center border border-gray-200';
const PILL_INACTIVE = 'bg-white text-vintage-secondary vintage-border hover:bg-vintage-primary hover:text-white';

interface NavLink {
  id: number
  label: string
  href: string
}

interface HubSectionProps {
  title: string
  teaserHtml: string
  filterQuery: string
  showAllLink: string
  links?: NavLink[]
  imageUrl?: string | null
  image_alt?: string
  isPublic: boolean
  isBrand?: "TRUE" | "FALSE"
  variant?: "PRIMARY" | "SECONDARY"
  brand?: { id: number; href: string; label: string } | null
  priority?: boolean
}

function CategoryLinks({ links, variant, isBrand, brandHref }: { isBrand: boolean, showAllLink: string; links?: NavLink[], brandHref?: string, variant: "PRIMARY" | "SECONDARY" }) {
  return (
     <>
      {links && links.length > 0 && (
        <>
        <ul className="flex flex-wrap gap-2 justify-center">
          {links.map(item => (
            <li key={item.id}>
              <Link
                key={item.id}
                href={isBrand && brandHref ? item.href.replace('/vintage', brandHref) : item.href}
                className={`${PILL_BASE_SMALL} ${PILL_INACTIVE}`}
              >
                {item.label}
              </Link>
              </li>
          ))}
      
        </ul>
        </>
      )}
</>
  )
}

export async function HubSection({ isBrand, brand, title, teaserHtml, filterQuery, showAllLink, links, imageUrl, variant = "PRIMARY", isPublic, image_alt, priority = false }: HubSectionProps) {
  const safeHTML = sanitizeHTML(teaserHtml)
  const hits = filterQuery ? await searchProducts(filterQuery, 12) : []
  return (
    <>
    {isPublic && (
      <section className="border  bg-vintage-silverGray border-gray-200 p-6">
      <div className={"flex flex-col items-center"}>
        {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
        <img className="aspect-[4_/_3] object-cover w-[200px] h-[200px] rounded-full" alt={image_alt ?? title} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} width="400" height="300" src={imageUrl} />
        )}
        <div className={`${false ? `${variant === "PRIMARY" ? "ml-6 mt-4" : "mr-6 mt-4"}`: ""}`}>
            <p className="text-2xl font-semibold text-gray-900 text-center my-3">{title}</p>
          <section
            className="prose prose-sm text-gray-600 mb-4 max-w-none text-sm text-center"
            dangerouslySetInnerHTML={{ __html: safeHTML }}
          />
          <CategoryLinks variant="PRIMARY" showAllLink={showAllLink} links={links} isBrand={isBrand?.toUpperCase() === "TRUE"} brandHref={brand?.href ?? undefined} />
          {/*showAllLink !== "" && (
            <ButtonPrimary size={"SMALL"} text={"Alle anzeigen"} href={brand?.href ? showAllLink.replace('/vintage', brand?.href) : showAllLink} />
          )} */}
        </div>
        {filterQuery && (
          <div className="min-h-[280px]">
            <HubSectionHits hits={hits} title={title} />
          </div>
        )}
      </div>
    </section>
    )}

</>
  )
}
