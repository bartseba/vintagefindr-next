import 'server-only'

import { createDirectus, rest, readItems, readItem } from '@directus/sdk'
import { capitalizeFirstLetter } from '@/helper'

const directusUrl = process.env.DIRECTUS_URL || ''

/**
 * Shared Directus client factory.
 *
 * The Remix app (app/lib/directus.server.ts) instantiated a fresh
 * `createDirectus(url).with(rest())` client inline on nearly every one of
 * its ~27 exported functions, with no shared singleton. This consolidates
 * that into one client. Note: despite `DIRECTUS_TOKEN` being defined in
 * .env, no `staticToken(...)` is attached here — all Directus reads run
 * unauthenticated against the Public role, matching the Remix original
 * (confirmed `DIRECTUS_TOKEN` isn't even a valid credential against the
 * live instance).
 *
 * `onRequest` forces every Directus fetch to `cache: 'no-store'`. Without
 * this, Next.js's fetch Data Cache can cache a response from before a
 * field/relation existed in Directus — hit once (2026-09-02, `category_pages
 * .faq_block`: code deployed reading the field microseconds before the
 * field itself was created in Directus, and the resulting "field doesn't
 * exist yet" response got cached indefinitely). Every page reading through
 * this client is already `force-dynamic`/per-request rendered, so there's
 * no real caching benefit being given up — CMS content correctness matters
 * more here than shaving a Directus round-trip.
 */
function buildClient() {
  return createDirectus(directusUrl).with(rest({
    onRequest: (options) => ({ ...options, cache: 'no-store' }),
  }))
}

let client: ReturnType<typeof buildClient> | null = null

export function getDirectusClient() {
  if (!directusUrl) {
    throw new Error('DIRECTUS_URL is not configured')
  }
  if (!client) {
    client = buildClient()
  }
  return client
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  children?: NavigationItem[]
}

export interface NavigationSection {
  id: string
  label: string
  items: NavigationItem[]
}

interface RawNavigationItem {
  id: string
  label: string
  href: string
  children?: RawNavigationItem[]
  items?: RawNavigationItem[]
}

interface RawNavigationSection {
  id: string
  title: string
  slug: string
  items?: RawNavigationItem[]
  Megamenu?: RawNavigationItem[]
}

/**
 * Ported from app/lib/directus.server.ts:498 (getAllNavigationSections) as
 * the Phase 0 proof-of-life example — the other ~26 exported functions in
 * that file follow the same shape and get ported in the storefront phase.
 */
export async function getAllNavigationSections(): Promise<NavigationSection[]> {
  const client = getDirectusClient()

  const fields = [
    'id', 'title', 'slug',
    'items.id', 'items.label', 'items.href', 'items.synonyme.name',
    'items.children.id', 'items.children.label', 'items.children.href', 'items.children.synonyme.name',
    'Megamenu.id', 'Megamenu.label', 'Megamenu.href', 'Megamenu.synonyme.name',
    'Megamenu.children.id', 'Megamenu.children.label', 'Megamenu.children.href', 'Megamenu.children.synonyme.name',
  ] as const

  const sections = await client.request<RawNavigationSection[]>(
    readItems('navigation_sections', {
      limit: -1,
      fields: fields as unknown as string[],
      deep: {
        items: {
          filter: { parent: { _null: true } },
          limit: -1,
          deep: {
            children: { limit: -1 },
            synonyme: { limit: -1 },
          },
        },
        Megamenu: {
          filter: { parent: { _null: true } },
          limit: -1,
          deep: {
            children: { limit: -1 },
            synonyme: { limit: -1 },
          },
        },
      },
    })
  )

  return sections.map((section): NavigationSection => {
    if (section.title === 'Megamenu' && section.Megamenu) {
      return { id: section.id, label: section.title, items: section.Megamenu }
    }
    return {
      id: section.id,
      label: section.title,
      items: (section.items ?? []).map((item) => ({
        ...item,
        children: item.children ?? item.items ?? [],
      })),
    }
  })
}

/**
 * Ported from app/lib/directus.server.ts:1160 (getNavigationItemByHref).
 */
export async function getNavigationItemByHref(href: string): Promise<{
  pageType: string | null
  ContentPage: { id: number } | null
} | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const response = await client.request<Array<{ pageType: string | null; ContentPage: { id: number } | null }>>(
      readItems('navigations_items', {
        filter: { href: { _eq: href } },
        fields: ['pageType', { ContentPage: ['id'] }] as unknown as string[],
        limit: 1,
      })
    )
    const item = response[0]
    return item ? { pageType: item.pageType ?? null, ContentPage: item.ContentPage ?? null } : null
  } catch (error) {
    console.error('Failed to fetch navigation item by href:', error)
    return null
  }
}

export interface HubContentItem {
  id: number
  title: string
  teaser: string
  filterQuery: string
  image: string
  image_alt: string
  variant: "PRIMARY" | "SECONDARY"
  isBrand: "TRUE" | "FALSE"
  isPublic: boolean
  link: { id: number; label: string; href: string } | null
  links: Array<{ id: number; label: string; href: string }>
}

/** Shared shape for `FaqBlock` (Directus collection) — used by `HubContentPage`,
 * `brand_pages`, and `category_pages`, all rendered via `FaqBlockSection`. */
export interface FaqBlockData {
  id: number
  Headline: string
  IntroText: string | null
  imageUrl: string | null
  image_alt: string | null
  isAiImage: boolean
  faqs: Array<{ id: number; question: string; answer: string }>
}

/** A single reorderable product-slider block on a `HubContentPage` — `query`
 * is a raw Algolia filter expression, resolved server-side via
 * `searchProducts` (see `ProductSliderBlock.tsx`). Unpublished items
 * (`isPublic: false`) are filtered out before this shape is built, same as
 * `categoryTeaserBlock`. */
export interface ProductSliderBlockItem {
  id: number
  title: string | null
  query: string | null
  isPublic: boolean
}

export interface HubContentPage {
  id: number
  Headline: string
  SubHeadline: string
  introHeadline: string | null
  introText: string | null
  seoTitle: string | null
  seoDescription: string | null
  brand_list?: { id: number; href: string; label: string } | null
  image: string | null
  imageUrl: string | null
  image_alt: string | null
  categoryTeaserBlock: HubContentItem[]
  content_block: Array<{
    id: number
    Headline: string
    IntroText: string | null
    intro_image: string | null
    button_text: string | null
    button_href: { id: number; href: string } | null
  }>
  productSliderBlock: ProductSliderBlockItem[]
  faqBlock: FaqBlockData | null
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

function buildDirectusImageUrl(
  file: { id: string; type?: string | null } | null | undefined,
  imageClass: string
): string | null {
  if (!file?.id) return null
  const ext = MIME_TO_EXT[file.type ?? ''] ?? 'jpg'
  const base = "https://vintagefindr-cms.b-cdn.net/"
  return `${base}${file.id}.${ext}?class=${imageClass}`
}

type RawHubContentItem = Omit<HubContentItem, 'links'> & {
  links?: Array<{ navigations_items_id: { id: number; label: string; href: string } | null }>
}

/** Raw `FaqBlock` shape straight from Directus — `image` is still a file
 * reference here, turned into `imageUrl` (via `buildDirectusImageUrl`) only
 * once mapped into `FaqBlockData`. */
interface RawFaqBlock {
  id: number
  Headline: string
  IntroText: string | null
  image: { id: string; type?: string | null } | null
  image_alt: string | null
  ki_bild: boolean | null
  faqs: Array<{ id: number; question: string; answer: string }>
}

const FAQ_BLOCK_FIELDS = ['id', 'Headline', 'IntroText', { image: ['id', 'type'] }, 'image_alt', 'ki_bild', { faqs: ['id', 'question', 'answer'] }]

interface RawHubContentPage {
  id: number
  Headline: string
  SubHeadline: string
  introHeadline: string | null
  introText: string | null
  seoTitle: string | null
  seoDescription: string | null
  brand: { id: number; Name: string; href: { id: number; href: string } | null } | Array<{ id: number; Name: string; href: { id: number; href: string } | null }> | null
  image: { id: string; type?: string | null } | null
  image_alt: string | null
  CategoryTeaserBlock?: Array<{ HubContent_id: RawHubContentItem }>
  content_block?: Array<{ IntroSection_id: HubContentPage['content_block'][number] }>
  productSliderBlock?: Array<{ ProductSliderBlock_id: { id: number; title: string | null; query: string | null; isPublic: boolean | null } }>
  faq_block: RawFaqBlock | null
}

/**
 * Ported from app/lib/directus.server.ts:1184 (getHubContentPageById).
 */
export async function getHubContentPageById(id: number): Promise<HubContentPage | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const response = await client.request<RawHubContentPage>(
      readItem('HubContentPage', id, {
        fields: [
          'id', 'Headline', 'SubHeadline', 'introHeadline', 'introText', 'seoTitle', 'seoDescription',
          { brand: ['id', 'Name', { href: ['id', 'href'] }] },
          { image: ['id', 'type'] },
          'image_alt',
          {
            CategoryTeaserBlock: [
              { HubContent_id: ['id', 'title', 'teaser', 'filterQuery', 'image', 'variant', 'isBrand', 'isPublic', 'image_alt',
                { link: ['id', 'label', 'href'] },
                { links: [{ navigations_items_id: ['id', 'label', 'href'] }] }
              ] }
            ],
            content_block: [
              { IntroSection_id: ['id', 'Headline', 'IntroText', 'intro_image', 'button_text', { button_href: ['id', 'href'] }] }
            ],
            productSliderBlock: [
              { ProductSliderBlock_id: ['id', 'title', 'query', 'isPublic'] }
            ]
          },
          { faq_block: FAQ_BLOCK_FIELDS },
        ] as unknown as string[],
        deep: {
          CategoryTeaserBlock: { sort: ['sort'] },
          content_block: { sort: ['sort'] },
          productSliderBlock: { sort: ['sort'] },
          faq_block: { faqs: { sort: ['sort'] } },
        } as unknown as Record<string, unknown>,
      })
    )
    const raw = response

    const mapItem = (junction: NonNullable<RawHubContentPage['CategoryTeaserBlock']>[number]): HubContentItem => {
      const item = junction.HubContent_id
      return {
        ...item,
        links: (item.links ?? []).map((l) => l.navigations_items_id).filter((l): l is { id: number; label: string; href: string } => l !== null),
      }
    }

    return {
      id: raw.id,
      Headline: raw.Headline,
      SubHeadline: raw.SubHeadline,
      introHeadline: raw.introHeadline ?? null,
      introText: raw.introText ?? null,
      seoTitle: raw.seoTitle ?? null,
      seoDescription: raw.seoDescription ?? null,
      brand_list: (() => {
        const b = Array.isArray(raw.brand) ? raw.brand[0] : raw.brand
        return b?.href?.href ? { id: b.id, href: b.href.href, label: b.Name } : null
      })(),
      image: raw.image?.id ?? null,
      imageUrl: buildDirectusImageUrl(raw.image, 'contentpage'),
      image_alt: raw.image_alt ?? null,
      categoryTeaserBlock: (raw.CategoryTeaserBlock ?? []).map(mapItem),
      content_block: (raw.content_block ?? []).map((junction) => ({ ...junction.IntroSection_id })),
      productSliderBlock: (raw.productSliderBlock ?? []).map((junction) => ({
        id: junction.ProductSliderBlock_id.id,
        title: junction.ProductSliderBlock_id.title ?? null,
        query: junction.ProductSliderBlock_id.query ?? null,
        isPublic: junction.ProductSliderBlock_id.isPublic ?? false,
      })),
      faqBlock: raw.faq_block ? {
        id: raw.faq_block.id,
        Headline: raw.faq_block.Headline,
        IntroText: raw.faq_block.IntroText ?? null,
        imageUrl: buildDirectusImageUrl(raw.faq_block.image, 'blockimage'),
        image_alt: raw.faq_block.image_alt ?? null,
        isAiImage: raw.faq_block.ki_bild ?? false,
        faqs: raw.faq_block.faqs ?? [],
      } : null,
    }
  } catch (error) {
    console.error('Failed to fetch HubContentPage:', error)
    return null
  }
}

export interface SeoFooterData {
  intro_html?: string
  brand_list_text?: string
  brand_list?: Array<{ label: string; href: string }>
  category_list_text?: string
  category_list?: Array<{ label: string; href: string }>
}

/**
 * Loosely-typed union of the fields actually read downstream from Directus's
 * `brands`, `brand_pages`, and `category_pages` collections — three
 * different collections with overlapping-but-not-identical shapes, mapped
 * into one interface exactly like `app/lib/directus.server.ts` did (via
 * `as CategoryPage` casts there; here via explicit optional fields instead
 * of `any`).
 */
export interface CategoryPage {
  id: string | number
  h1?: string
  intro_html?: string
  seo_title?: string
  seo_description?: string
  canonical_url?: string
  default_sort?: 'newest' | 'price_asc' | 'price_desc'
  brand?: string
  altText?: string
  keyword?: Array<{ Name?: string }>
  seo_footer?: SeoFooterData
  seo_brand_footer?: SeoFooterData
  /** Populated by `getBrandCategoryPage` and `getCategoryPage` (`brand_pages`
   * and `category_pages` both have a `faq_block` field); `getBrands` (the
   * `brands` collection) doesn't and never sets this. */
  faqBlock?: FaqBlockData | null
}

interface RawBrandOrCategoryPage {
  id: string | number
  h1?: string
  intro_html?: string
  seo_title?: string
  seo_description?: string
  canonical_url?: string
  default_sort?: 'newest' | 'price_asc' | 'price_desc'
  keyword?: Array<{ Name?: string }>
  seo_footer?: SeoFooterData
  faq_block?: RawFaqBlock
}

/**
 * Ported from app/lib/directus.server.ts:150 (getBrandCategoryPage). Handles
 * `brand_pages` — templated copy with `{brand}` placeholders, resolved
 * against the brand segment in `path` (e.g. `vintage/adidas/jacken` →
 * brand `adidas`).
 */
export async function getBrandCategoryPage(path: string): Promise<CategoryPage | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const brandName = path.split('/')[1]
    const response = await client.request<
      Array<{
        id: string | number
        h1?: string
        intro_html?: string
        seo_title?: string
        seo_description?: string
        canonical_url?: string
        alt?: string
        keyword?: Array<{ Name?: string }>
        seo_brand_footer?: {
          intro_html?: string
          brand_list_text?: string
          brand_list?: Array<Record<string, unknown>>
          category_list_text?: string
          category_list?: Array<Record<string, unknown>>
        }
        faq_block?: RawFaqBlock
      }>
    >(
      readItems('brand_pages', {
        fields: [
          '*', 'nav_items.*', 'seo_brand_footer.*',
          { faq_block: FAQ_BLOCK_FIELDS },
        ] as unknown as string[],
        deep: { faq_block: { faqs: { sort: ['sort'] } } } as unknown as Record<string, unknown>,
        limit: 1,
        filter: {
          nav_items: { href: { _eq: `/${path.replace(`/${brandName}`, '')}` } },
        } as unknown as Record<string, unknown>,
      })
    )
    const data = response[0]
    if (!data) return null
    
    const replaceBrand = <T,>(text: T): T =>
      typeof text === 'string' ? (text.replaceAll('{brand}', capitalizeFirstLetter(brandName)) as unknown as T) : text

    const replaceInArray = (arr?: Array<Record<string, unknown>>) =>
      (arr ?? []).map((item) => ({
        label: replaceBrand(item.label as string),
        href: replaceBrand(item.href as string),
      }))

    return {
      id: data.id,
      h1: replaceBrand(data.h1),
      intro_html: replaceBrand(data.intro_html),
      seo_title: replaceBrand(data.seo_title),
      seo_description: replaceBrand(data.seo_description),
      canonical_url: replaceBrand(data.canonical_url),
      brand: brandName,
      keyword: data.keyword?.map((k) => ({ Name: replaceBrand(k.Name) })),
      altText: replaceBrand(data.alt),
      seo_brand_footer: data.seo_brand_footer ? {
        intro_html: replaceBrand(data.seo_brand_footer.intro_html),
        brand_list_text: replaceBrand(data.seo_brand_footer.brand_list_text),
        brand_list: replaceInArray(data.seo_brand_footer.brand_list),
        category_list_text: replaceBrand(data.seo_brand_footer.category_list_text),
        category_list: replaceInArray(data.seo_brand_footer.category_list),
      } : undefined,
      faqBlock: data.faq_block ? {
        id: data.faq_block.id,
        Headline: replaceBrand(data.faq_block.Headline),
        IntroText: replaceBrand(data.faq_block.IntroText),
        imageUrl: buildDirectusImageUrl(data.faq_block.image, 'blockimage'),
        image_alt: replaceBrand(data.faq_block.image_alt),
        isAiImage: data.faq_block.ki_bild ?? false,
        faqs: data.faq_block.faqs.map((faq) => ({
          id: faq.id,
          question: replaceBrand(faq.question),
          answer: replaceBrand(faq.answer),
        })),
      } : null,
    }
  } catch (error) {
    console.error('Failed to fetch brand category page:', error)
    return null
  }
}

/**
 * Ported from app/lib/directus.server.ts:225 (getBrands). Handles the
 * `brands` collection (brand root pages, e.g. `vintage/adidas`).
 */
export async function getBrands(path: string): Promise<CategoryPage | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const response = await client.request<RawBrandOrCategoryPage[]>(
      readItems('brands', {
        filter: { href: { _eq: `/${path}` } } as unknown as Record<string, unknown>,
        fields: ['*', 'seo_footer.*'] as unknown as string[],
        limit: 1,
      })
    )
    return response[0] ?? null
  } catch (error) {
    console.error('Failed to fetch brand page:', error)
    return null
  }
}

/**
 * Ported from app/lib/directus.server.ts:258 (getCategoryPage). Handles the
 * `category_pages` collection (non-brand category pages, e.g.
 * `vintage/jacken`).
 */
export async function getCategoryPage(path: string): Promise<CategoryPage | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const response = await client.request<RawBrandOrCategoryPage[]>(
      readItems('category_pages', {
        filter: { nav_item: { href: { _eq: `/${path}` } } } as unknown as Record<string, unknown>,
        fields: [
          '*', 'seo_footer.*',
          { faq_block: FAQ_BLOCK_FIELDS },
        ] as unknown as string[],
        deep: { faq_block: { faqs: { sort: ['sort'] } } } as unknown as Record<string, unknown>,
        limit: 1,
      })
    )
    const data = response[0]
    if (!data) return null
    return {
      ...data,
      faqBlock: data.faq_block ? {
        id: data.faq_block.id,
        Headline: data.faq_block.Headline,
        IntroText: data.faq_block.IntroText ?? null,
        imageUrl: buildDirectusImageUrl(data.faq_block.image, 'blockimage'),
        image_alt: data.faq_block.image_alt ?? null,
        isAiImage: data.faq_block.ki_bild ?? false,
        faqs: data.faq_block.faqs,
      } : null,
    }
  } catch (error) {
    console.error('Failed to fetch category page:', error)
    return null
  }
}

/**
 * Ported from app/lib/directus.server.ts:608 (getAllBrandHrefs).
 */
export async function getAllBrandHrefs(): Promise<string[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const response = await client.request<Array<{ slug?: string }>>(
      readItems('brands', { fields: ['slug'], limit: -1 })
    )
    return response.map((brand) => brand.slug).filter((slug): slug is string => !!slug)
  } catch (error) {
    console.error('Failed to fetch brand hrefs:', error)
    return []
  }
}

export interface SidebarNavigationItem {
  id: string | number
  label: string
  href: string
  isBrand: boolean
  sort: number
  notShowCategory: Array<string | number>
  children: Array<{ id: string | number; label: string; href: string }>
}

interface RawSidebarItem {
  id: string | number
  label: string
  href: string
  parent: { id: string | number } | string | number | null
  sort: number | null
  isBrand: boolean | string | number | null
  item?: Array<{ id: string | number; label: string; href: string; sort?: number | null }>
  notShowCategory?: Array<{ related_navigations_items_id: string | number }>
}

export interface PopularBrand {
  id: string | number
  label: string
  href: string
}

/**
 * `navigation_sections` id 11 ("Beliebte Marken") — shown under the
 * empty-category filter hint (`CategorySearch.tsx`) instead of the (empty,
 * pointless) facet accordions.
 */
export async function getPopularBrands(): Promise<PopularBrand[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const sections = await client.request<Array<{ id: number; items: PopularBrand[] }>>(
      readItems('navigation_sections', {
        filter: { id: { _eq: 11 } },
        fields: ['id', 'items.id', 'items.label', 'items.href'] as unknown as string[],
        limit: 1,
      })
    )
    return sections[0]?.items ?? []
  } catch (error) {
    console.error('Failed to fetch popular brands:', error)
    return []
  }
}

/**
 * Ported from app/lib/directus.server.ts:1292 (getSidebarNavigationItems).
 * Builds the hierarchical brand-pill / category-pill sidebar structure:
 * non-brand items with children become category groups, brand items use
 * their `item` relation (nav pills) as children.
 */
export async function getSidebarNavigationItems(): Promise<SidebarNavigationItem[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const response = await client.request<RawSidebarItem[]>(
      readItems('navigations_items', {
        fields: [
          'id', 'label', 'href', 'parent', 'sort', 'isBrand',
          { item: ['id', 'label', 'href', 'sort'] },
          { notShowCategory: ['related_navigations_items_id'] },
        ] as unknown as string[],
        sort: ['sort'],
        limit: -1,
      })
    )

    const isBrandValue = (val: RawSidebarItem['isBrand']) => val === true || val === 'true' || val === 1 || val === '1'

    const brandItems = response.filter((item) => isBrandValue(item.isBrand))
    const nonBrandParentItems = response.filter((item) => !isBrandValue(item.isBrand) && item.parent === null)
    const nonBrandChildItems = response.filter((item) => !isBrandValue(item.isBrand) && item.parent !== null)

    const itemsWithChildren: SidebarNavigationItem[] = []
    const itemsWithoutChildren: SidebarNavigationItem[] = []

    nonBrandParentItems.forEach((parent) => {
      const children = nonBrandChildItems
        .filter((child) => {
          const childParentId = typeof child.parent === 'object' && child.parent !== null ? child.parent.id : child.parent
          return String(childParentId) === String(parent.id)
        })
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
        .map((child) => ({ id: child.id, label: child.label, href: child.href }))

      if (children.length > 0) {
        itemsWithChildren.push({
          id: parent.id,
          label: parent.label,
          href: parent.href,
          children,
          isBrand: false,
          sort: parent.sort ?? 0,
          notShowCategory: (parent.notShowCategory ?? []).map((n) => n.related_navigations_items_id),
        })
      }
    })

    brandItems.forEach((brand) => {
      const brandChildren = Array.isArray(brand.item)
        ? [...brand.item].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map((i) => ({ id: i.id, label: i.label, href: i.href }))
        : []

      itemsWithoutChildren.push({
        id: brand.id,
        label: brand.label,
        href: brand.href,
        children: brandChildren,
        isBrand: true,
        sort: brand.sort ?? 0,
        notShowCategory: (brand.notShowCategory ?? []).map((n) => n.related_navigations_items_id),
      })
    })

    itemsWithChildren.sort((a, b) => a.sort - b.sort)
    itemsWithoutChildren.sort((a, b) => a.sort - b.sort)

    return [...itemsWithChildren, ...itemsWithoutChildren]
  } catch (error) {
    console.error('Failed to fetch sidebar navigation items:', error)
    return []
  }
}

export interface HighlightGuideTag {
  name: string
  slug: string
}

export interface HighlightGuide {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  hero_image: string | null
  heroImageUrl: string | null
  heroImageThumbUrl: string | null
  categoryName: string | null
  tags: HighlightGuideTag[]
  readingMinutes: number
}

export interface HighlightSection {
  id: number
  slug: string
  title: string
  subtitle: string
  cta_label: string
  cta_url: string
  placement?: string | null
}

/**
 * Ported from app/lib/directus.server.ts:934 (estimateReadingMinutes).
 */
export function estimateReadingMinutes(html: string | null | undefined): number {
  if (!html) return 1
  const text = html.replace(/<[^>]+>/g, ' ').trim()
  const wordCount = text.length > 0 ? text.split(/\s+/).length : 0
  return Math.max(1, Math.ceil(wordCount / 200))
}

const GUIDE_FIELDS = [
  'id',
  'title',
  'slug',
  'excerpt',
  'body',
  { category: ['name'] },
  { tags: [{ tags_id: ['name', 'slug'] }] },
  { hero_image: ['id', 'type'] },
]

interface RawHighlightGuide {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  category: { name: string } | null
  tags: Array<{ tags_id: { name: string; slug: string } | null }>
  hero_image: { id: string; type?: string | null } | null
}

function mapHighlightGuide(raw: RawHighlightGuide): HighlightGuide {
  const tags = (raw.tags ?? [])
    .map((t) => t.tags_id)
    .filter((t): t is { name: string; slug: string } => !!t?.slug)

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    body: raw.body,
    hero_image: raw.hero_image?.id ?? null,
    heroImageUrl: buildDirectusImageUrl(raw.hero_image, 'blockimage'),
    heroImageThumbUrl: buildDirectusImageUrl(raw.hero_image, 'thumbnail'),
    categoryName: raw.category?.name ?? null,
    tags,
    readingMinutes: estimateReadingMinutes(raw.body || raw.excerpt),
  }
}

interface RawHighlightSection {
  id: number
  slug: string
  title: string
  subtitle: string
  cta_label: string
  cta_url: string
  placement?: string | null
  featured_guide: RawHighlightGuide | null
  guides: Array<{ guides_id: RawHighlightGuide | null }>
}

async function fetchHighlightSection(filter: Record<string, unknown>): Promise<{ section: HighlightSection; guides: HighlightGuide[]; featuredGuide: HighlightGuide | null } | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const sections = await client.request<RawHighlightSection[]>(
      readItems('highlight_sections', {
        // 'icon' deliberately excluded — the live Directus API token doesn't
        // have field-level access to it (403), and nothing downstream reads
        // `HighlightSection.icon` anyway.
        fields: [
          'id', 'slug', 'title', 'subtitle', 'cta_label', 'cta_url', 'placement',
          { featured_guide: GUIDE_FIELDS },
          { guides: [{ guides_id: GUIDE_FIELDS }] },
        ] as unknown as string[],
        filter: filter as Record<string, unknown>,
        limit: 1,
      })
    )

    const sectionData = sections[0]
    if (!sectionData) return null

    const section: HighlightSection = {
      id: sectionData.id,
      slug: sectionData.slug,
      title: sectionData.title,
      subtitle: sectionData.subtitle,
      cta_label: sectionData.cta_label,
      cta_url: sectionData.cta_url,
      placement: sectionData.placement ?? null,
    }

    const featuredGuide: HighlightGuide | null = sectionData.featured_guide ? mapHighlightGuide(sectionData.featured_guide) : null

    const guides: HighlightGuide[] = (sectionData.guides ?? [])
      .filter((g): g is { guides_id: RawHighlightGuide } => !!g.guides_id?.id)
      .map((g) => mapHighlightGuide(g.guides_id))
      // Related list shouldn't repeat the featured article
      .filter((g) => !featuredGuide || g.id !== featuredGuide.id)

    return { section, guides, featuredGuide }
  } catch (error) {
    console.error('Failed to fetch highlight section:', error)
    return null
  }
}

/**
 * Ported from app/lib/directus.server.ts:1051 (getHighlightSectionBySlug).
 */
export async function getHighlightSectionBySlug(slug: string) {
  return fetchHighlightSection({ slug: { _eq: slug } })
}

/**
 * Ported from app/lib/directus.server.ts:1055 (getHighlightSectionByPlacement).
 */
export async function getHighlightSectionByPlacement(placement: string) {
  return fetchHighlightSection({ placement: { _eq: placement } })
}

interface RawProductHighlightSlider {
  index_id: string
  title: string
  subtitle?: string
  cta_showall: string
  emptyTitle: string
  query: string
  active: boolean
}

/**
 * Ported from app/lib/directus.server.ts:807 (getProductHighlightSlider).
 * Note the Directus collection name really is `ProductHighlightSLider`
 * (mid-word capitalization typo) — preserved exactly, it's the actual
 * collection name in the live CMS, not a local naming choice.
 */
export async function getProductHighlightSlider(): Promise<RawProductHighlightSlider | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const sliders = await client.request<RawProductHighlightSlider[]>(
      readItems('ProductHighlightSLider', {
        fields: ['*'],
        filter: { active: { _eq: true } } as unknown as Record<string, unknown>,
      })
    )
    return sliders[0] ?? null
  } catch (error) {
    console.error('Failed to fetch product highlight slider:', error)
    return null
  }
}

// ========== Ratgeber (guides) ==========

export interface GuideCategory {
  id: number
  name: string
  slug: string
  parent: number | null
  sort: number
  children?: GuideCategory[]
  intro_html: string
  seo_title?: string
}

export interface GuideTeaserItem {
  id: number
  Headline: string
  text: string
  url: string
}

export interface GuideTeaserListEntry {
  id: number
  item: GuideTeaserItem
}

export interface Guide {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  /**
   * Full CDN URL (built via `buildDirectusImageUrl`) — the Remix original's
   * `Guide.hero_image` typed this as a plain string but requested it via a
   * bare `'*'` field list, which returns just the Directus file UUID, not a
   * URL (confirmed against the live API: `hero_image: "9ed1b955-..."`, not
   * a URL) — `<img src={guide.hero_image}>` on `/ratgeber` would render a
   * broken image. Fixed here since the correct `buildDirectusImageUrl`
   * infra already exists (built for the homepage's highlight-section
   * guides) and using it consistently isn't a new behavior, just makes an
   * already-intended field actually work.
   */
  hero_image: string | null
  category: number
  status: string
  published_at: string
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  tag_slugs: string[]
  teaser?: GuideTeaserItem
  teaser_list?: GuideTeaserListEntry[]
}

/**
 * Ported from app/lib/directus.server.ts:697 (getGuideCategories).
 */
export async function getGuideCategories(): Promise<GuideCategory[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const categories = await client.request<GuideCategory[]>(
      readItems('guide_categories', { fields: ['*'], sort: ['sort', 'name'], limit: -1 })
    )
    return categories
  } catch (error) {
    console.error('Failed to fetch guide categories:', error)
    return []
  }
}

export interface HighlightCategoryItem {
  id: number
  name: string
  subline: string | null
  iconUrl: string | null
  href: string
}

interface RawHighlightCategory {
  id: number
  name: string
  subline: string | null
  icon: { id: string; type: string | null } | null
  href: string
}

/**
 * Startseiten-Kategorie-Kacheln ("Unsere Vintage Kategorien"), flache
 * sortierbare Liste ohne m2m-Verknüpfung (nur auf der Startseite genutzt).
 */
export async function getHighlightCategories(): Promise<HighlightCategoryItem[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const response = await client.request<RawHighlightCategory[]>(
      readItems('HighlightCategory', {
        fields: ['id', 'name', 'subline', { icon: ['id', 'type'] }, 'href'] as unknown as string[],
        filter: { isPublic: { _eq: true } },
        sort: ['sort'],
        limit: -1,
      })
    )
    return response.map((item) => ({
      id: item.id,
      name: item.name,
      subline: item.subline,
      iconUrl: buildDirectusImageUrl(item.icon, 'categories'),
      href: item.href,
    }))
  } catch (error) {
    console.error('Failed to fetch highlight categories:', error)
    return []
  }
}

/**
 * Ported from app/lib/directus.server.ts:718 (buildCategoryTree).
 */
export function buildCategoryTree(categories: GuideCategory[]): GuideCategory[] {
  const categoryMap = new Map<number, GuideCategory>()
  const rootCategories: GuideCategory[] = []

  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!
    if (cat.parent === null) {
      rootCategories.push(category)
    } else {
      const parent = categoryMap.get(cat.parent)
      if (parent) parent.children!.push(category)
    }
  })

  return rootCategories
}

/**
 * Ported from app/lib/directus.server.ts:741 (getGuideCategoryBySlugPath).
 */
export async function getGuideCategoryBySlugPath(slugPath: string[]): Promise<GuideCategory | null> {
  if (!directusUrl || slugPath.length === 0) return null
  try {
    const categories = await getGuideCategories()

    let currentCategory: GuideCategory | null = null
    let currentParent: number | null = null

    for (const slug of slugPath) {
      const found = categories.find((cat) => cat.slug === slug && cat.parent === currentParent)
      if (!found) return null
      currentCategory = found
      currentParent = found.id
    }

    return currentCategory
  } catch (error) {
    console.error('Failed to fetch category by slug path:', error)
    return null
  }
}

interface RawGuideListItem {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  hero_image: { id: string; type?: string | null } | null
  category: number
  status: string
  published_at: string
  seo_title: string | null
  seo_description: string | null
  tag_slugs: string[] | null
  teaser?: GuideTeaserItem | null
  teaser_list?: Array<{ id: number; item: GuideTeaserItem | null }> | null
}

// 'seo_keywords' deliberately excluded — the live Directus API token
// doesn't have field-level access to it (403), same class of gap as
// `highlight_sections.icon` hit on the homepage. `generateMetadata` falls
// back to its default keywords string in its absence.
const GUIDE_LIST_FIELDS = [
  'id', 'title', 'slug', 'excerpt', 'body', 'category', 'status', 'published_at',
  'seo_title', 'seo_description', 'tag_slugs',
  { hero_image: ['id', 'type'] },
  { teaser: ['id', 'Headline', 'text', 'url'] },
]

function mapGuideItem(raw: RawGuideListItem): Guide {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    body: raw.body,
    hero_image: buildDirectusImageUrl(raw.hero_image, 'blockimage'),
    category: raw.category,
    status: raw.status,
    published_at: raw.published_at,
    seo_title: raw.seo_title,
    seo_description: raw.seo_description,
    seo_keywords: null,
    tag_slugs: raw.tag_slugs ?? [],
    teaser: raw.teaser ?? undefined,
    teaser_list: (raw.teaser_list ?? [])
      .filter((t): t is { id: number; item: GuideTeaserItem } => !!t.item)
  }
}

/**
 * Ported from app/lib/directus.server.ts:772 (getGuidesByCategory).
 */
export async function getGuidesByCategory(categoryId: number): Promise<Guide[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const guides = await client.request<RawGuideListItem[]>(
      readItems('guides', {
        fields: GUIDE_LIST_FIELDS as unknown as string[],
        filter: { category: { _eq: categoryId }, status: { _eq: 'published' } } as unknown as Record<string, unknown>,
        sort: ['-published_at'],
        limit: -1,
      })
    )
    return guides.map(mapGuideItem)
  } catch (error) {
    console.error('Failed to fetch guides by category:', error)
    return []
  }
}

/**
 * Ported from app/lib/directus.server.ts:828 (getGuideBySlug).
 */
export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  if (!directusUrl) return null
  const client = getDirectusClient()
  try {
    const guides = await client.request<RawGuideListItem[]>(
      readItems('guides', {
        fields: [
          ...GUIDE_LIST_FIELDS,
          { teaser_list: ['id', { item: ['id', 'Headline', 'text', 'url'] }] },
        ] as unknown as string[],
        filter: { slug: { _eq: slug }, status: { _eq: 'published' } } as unknown as Record<string, unknown>,
        limit: 1,
      })
    )
    return guides[0] ? mapGuideItem(guides[0]) : null
  } catch (error) {
    console.error('Failed to fetch guide by slug:', error)
    return null
  }
}

interface RawRelatedGuide {
  id: number
  title: string
  slug: string
  excerpt: string
  published_at: string
  tag_slugs: string[] | null
  hero_image: { id: string; type?: string | null } | null
}

/**
 * Ported from app/lib/directus.server.ts:878 (getRelatedGuides). Requests a
 * smaller field set than `getGuidesByCategory`/`getGuideBySlug` — matches
 * the original, which only ever renders these via `GuideCard` (title,
 * excerpt, hero image, tags, published date).
 */
export async function getRelatedGuides(categoryId: number, currentGuideId: number, limit = 5): Promise<Guide[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const guides = await client.request<RawRelatedGuide[]>(
      readItems('guides', {
        fields: ['id', 'title', 'slug', 'excerpt', 'published_at', 'tag_slugs', { hero_image: ['id', 'type'] }] as unknown as string[],
        filter: {
          category: { _eq: categoryId },
          status: { _eq: 'published' },
          id: { _neq: currentGuideId },
        } as unknown as Record<string, unknown>,
        sort: ['-published_at'],
        limit,
      })
    )
    return guides.map((g): Guide => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      excerpt: g.excerpt,
      body: '',
      hero_image: buildDirectusImageUrl(g.hero_image, 'blockimage'),
      category: categoryId,
      status: 'published',
      published_at: g.published_at,
      seo_title: null,
      seo_description: null,
      seo_keywords: null,
      tag_slugs: g.tag_slugs ?? [],
    }))
  } catch (error) {
    console.error('Failed to fetch related guides:', error)
    return []
  }
}

/**
 * Ported from app/lib/directus.server.ts:905 (getCategoryPath).
 */
export async function getCategoryPath(categoryId: number): Promise<GuideCategory[]> {
  if (!directusUrl) return []
  try {
    const categories = await getGuideCategories()
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]))

    const path: GuideCategory[] = []
    let currentId: number | null = categoryId

    while (currentId !== null) {
      const cat = categoryMap.get(currentId)
      if (!cat) break
      path.unshift(cat)
      currentId = cat.parent
    }

    return path
  } catch (error) {
    console.error('Failed to build category path:', error)
    return []
  }
}

export interface FAQ {
  id: number
  question: string
  answer: string
  sort: number
  status: string
}

/**
 * Ported from app/lib/directus.server.ts:1062 (getFaqBlockById). Used by
 * `/hilfe`'s FAQ list (the "Häufig gestellte Fragen" `FaqBlock`, id 4 in
 * the live CMS) — distinct from `HubContentPage.faqBlock`, which is fetched
 * inline as part of `getHubContentPageById`.
 */
export async function getFaqBlockById(id: number): Promise<FAQ[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const response = await client.request<{ faqs: Array<{ id: number; question: string; answer: string }> }>(
      readItem('FaqBlock', id, {
        fields: [{ faqs: ['id', 'question', 'answer'] }] as unknown as string[],
        deep: { faqs: { sort: ['sort'] } } as unknown as Record<string, unknown>,
      })
    )
    return (response.faqs ?? []).map((f, index) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sort: index + 1,
      status: 'published',
    }))
  } catch (error) {
    console.error('Failed to fetch FaqBlock from Directus:', error)
    return []
  }
}

export interface ProductFormNavigationItem {
  id: string
  label: string
  href: string
  children?: Array<{ id: string; label: string; href: string }>
}

/**
 * Ported from app/lib/directus.server.ts:572 (getAllNavigationItems) — the
 * flat `navigation_items` parent/children tree used to build the vendor
 * product form's category dropdown. Distinct from `getAllNavigationSections`
 * (mega-menu sections/`Megamenu` collection), a different Directus shape
 * for a different consumer.
 */
export async function getAllNavigationItems(): Promise<ProductFormNavigationItem[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const parentItems = await client.request<ProductFormNavigationItem[]>(
      readItems('navigation_items', {
        filter: {
          parent: { _null: true },
        },
        fields: ['id', 'label', 'href', { children: ['id', 'label', 'href'] }] as unknown as string[],
        sort: ['sort'],
        limit: -1,
      })
    )
    return parentItems
  } catch (error) {
    console.error('Directus navigation items error:', error)
    return []
  }
}

export interface DirectusBrand {
  id: number
  Name: string
  sort: number | null
}

/**
 * Ported from app/lib/directus.server.ts:1452 (getAllBrands) — the
 * `brand_list` collection, used for the vendor product form's brand
 * dropdown.
 */
export async function getAllBrands(): Promise<DirectusBrand[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    return await client.request<DirectusBrand[]>(
      readItems('brand_list', {
        fields: ['id', 'Name', 'sort'],
        sort: ['Name'],
        limit: -1,
      })
    )
  } catch (error) {
    console.error('Failed to fetch brands from Directus:', error)
    return []
  }
}

export interface DirectusSize {
  id: number
  Name: string
  parent: number | null
  sort: number | null
}

/**
 * Ported from app/lib/directus.server.ts:1478 (getAllSizes) — the `Size`
 * collection (self-referencing parent/child, e.g. "EU Größen" > "EU 40"),
 * used for the vendor product form's size dropdown.
 */
export async function getAllSizes(): Promise<DirectusSize[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    return await client.request<DirectusSize[]>(
      readItems('Size', {
        fields: ['id', 'Name', 'parent', 'sort'],
        sort: ['sort'],
        limit: -1,
      })
    )
  } catch (error) {
    console.error('Failed to fetch sizes from Directus:', error)
    return []
  }
}

const FALLBACK_VALID_CATEGORIES = [
  'pullis-hoodies', 'trainingsjacken', 'hemden', 't-shirts', 'polos', 'jeans', 'reworks', 'accessoires',
  'sweater-hoodies', 'knitwear', 'trikots-jerseys', 'blazer',
  'jacken', 'fleece-jacken', 'leichte-jacken', 'dickere-jacken', 'lederjacken', 'westen', 'schals',
  'hosen', 'cord-chinos', 'track-pants', 'shorts',
]

/**
 * Ported from app/lib/directus.server.ts:1399 (getValidCategories) — reuses
 * `getAllNavigationSections()` (Phase 0) exactly like the Remix original
 * reused its own `getAllNavigationSections()`, extracting category slugs
 * from every item/child href. Used by CSV import validation to check
 * whether a row's category is real.
 */
export async function getValidCategories(): Promise<string[]> {
  try {
    const sections = await getAllNavigationSections()

    if (!sections || sections.length === 0) {
      return FALLBACK_VALID_CATEGORIES
    }

    const categories: string[] = []

    for (const section of sections) {
      for (const item of section.items || []) {
        if (item.href) {
          const slug = item.href.split('/').pop()
          if (slug) categories.push(slug)
        }
        for (const child of item.children || []) {
          if (child.href) {
            const childSlug = child.href.split('/').pop()
            if (childSlug) categories.push(childSlug)
          }
        }
      }
    }

    const uniqueCategories = [...new Set(categories)]
    return uniqueCategories.length > 0 ? uniqueCategories : FALLBACK_VALID_CATEGORIES
  } catch (error) {
    console.error('Failed to fetch valid categories from Directus:', error)
    return FALLBACK_VALID_CATEGORIES
  }
}

const FALLBACK_SIZE_KEYWORDS: Record<string, string[]> = {
  'XS': ['xs', 'extra small', 'extrasmall'],
  'S': ['s', 'small', 'klein'],
  'M': ['m', 'medium', 'mittel'],
  'L': ['l', 'large', 'groß'],
  'XL': ['xl', 'extra large', 'extralarge'],
  'XXL': ['xxl', '2xl'],
  'XXXL': ['xxxl', '3xl'],
  '32': ['32', 'w32'],
  '34': ['34', 'w34'],
  '36': ['36', 'w36'],
  '38': ['38', 'w38'],
  '40': ['40', 'w40'],
  '42': ['42', 'w42'],
  '44': ['44', 'w44'],
  '46': ['46', 'w46'],
  '48': ['48', 'w48'],
  '50': ['50', 'w50'],
}

interface RawSizeWithSynonyms {
  id: number
  Name: string
  synonyme?: Array<{ name: string | null }>
}

/**
 * Ported from app/lib/directus.server.ts:1527 (getSizeKeywords) — used by
 * CSV import to auto-detect a product's size from its title/CSV column
 * when it doesn't exactly match a known size name.
 */
export async function getSizeKeywords(): Promise<Record<string, string[]>> {
  if (!directusUrl) return FALLBACK_SIZE_KEYWORDS
  const client = getDirectusClient()

  try {
    const response = await client.request<RawSizeWithSynonyms[]>(
      readItems('Size', {
        fields: ['id', 'Name', { synonyme: ['name'] }] as unknown as string[],
        sort: ['sort'],
        limit: -1,
      })
    )

    const keywordMap: Record<string, string[]> = {}

    for (const item of response) {
      const sizeName = item.Name
      const keywords: string[] = []

      if (sizeName) {
        keywords.push(sizeName.toLowerCase())
      }

      if (item.synonyme && Array.isArray(item.synonyme) && item.synonyme.length > 0) {
        const synonyms = item.synonyme
          .map((syn) => syn.name?.trim().toLowerCase())
          .filter((name): name is string => Boolean(name && name.length > 0))
        keywords.push(...synonyms)
      }

      if (keywords.length > 0) {
        keywordMap[sizeName] = keywords
      }
    }

    return Object.keys(keywordMap).length > 0 ? keywordMap : FALLBACK_SIZE_KEYWORDS
  } catch (error) {
    console.error('Failed to fetch size keywords from Directus:', error)
    return FALLBACK_SIZE_KEYWORDS
  }
}

const FALLBACK_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'pullis-hoodies': ['pulli', 'pullover', 'hoodie', 'kapuze', 'sweatshirt'],
  'trainingsjacken': ['trainingsjacke', 'trackjacke', 'sportjacke', 'track jacket'],
  'hemden': ['hemd', 'shirt', 'bluse', 'button up', 'dress shirt'],
  't-shirts': ['t-shirt', 'tshirt', 'tee'],
  'polos': ['polo', 'poloshirt'],
  'jeans': ['jeans', 'denim'],
  'reworks': ['rework', 'upcycling', 'custom'],
  'accessoires': ['accessoire', 'tasche', 'mütze', 'schal'],
  'sweater-hoodies': ['sweater', 'hoodie', 'kapuze'],
  'knitwear': ['strick', 'knitwear', 'pullunder'],
  'trikots-jerseys': ['trikot', 'jersey', 'fußball'],
  'blazer': ['blazer', 'sakko'],
  'jacken': ['jacke', 'jacket'],
  'fleece-jacken': ['fleece', 'fleecejacke'],
  'leichte-jacken': ['leichte jacke', 'übergangsjacke'],
  'dickere-jacken': ['winterjacke', 'parka'],
  'lederjacken': ['lederjacke', 'leather jacket'],
  'westen': ['weste', 'vest'],
  'schals': ['schal', 'tuch'],
  'hosen': ['hose', 'pants'],
  'cord-chinos': ['cord', 'chino', 'cordhose', 'chinohose'],
  'track-pants': ['trackpants', 'jogginghose', 'sweatpants'],
  'shorts': ['shorts', 'kurze hose', 'bermuda'],
}

interface RawNavigationSectionWithSynonyms {
  id: string
  title: string
  slug: string
  items?: Array<{
    id: string
    label: string
    href?: string
    synonyme?: Array<{ name: string | null }>
    items?: Array<{
      id: string
      label: string
      href?: string
      synonyme?: Array<{ name: string | null }>
    }>
  }>
}

/**
 * Ported from app/lib/directus.server.ts:1606 (getCategoryKeywords) — a
 * separate, deeper `navigation_sections` query than `getAllNavigationSections`
 * (includes `synonyme` for keyword-based category detection during CSV
 * import), matching the Remix original's own separate query rather than
 * trying to extend the shared one.
 */
export async function getCategoryKeywords(): Promise<Record<string, string[]>> {
  if (!directusUrl) return FALLBACK_CATEGORY_KEYWORDS
  const client = getDirectusClient()

  try {
    const sections = await client.request<RawNavigationSectionWithSynonyms[]>(
      readItems('navigation_sections', {
        limit: -1,
        fields: [
          'id', 'title', 'slug',
          'items.id', 'items.label', 'items.href', 'items.synonyme.name',
          'items.items.id', 'items.items.label', 'items.items.href', 'items.items.synonyme.name',
        ],
        deep: {
          items: {
            filter: { parent: { _null: true } },
            limit: -1,
            deep: {
              children: { limit: -1 },
              synonyme: { limit: -1 },
            },
          },
        } as unknown as Record<string, unknown>,
      })
    )

    const keywordMap: Record<string, string[]> = {}

    const extractKeywords = (label: string | undefined, synonyme: Array<{ name: string | null }> | undefined): string[] => {
      const keywords: string[] = []
      if (label) keywords.push(label.toLowerCase())
      if (synonyme && Array.isArray(synonyme) && synonyme.length > 0) {
        const synonyms = synonyme
          .map((syn) => syn.name?.trim().toLowerCase())
          .filter((name): name is string => Boolean(name && name.length > 0))
        keywords.push(...synonyms)
      }
      return keywords
    }

    for (const section of sections) {
      for (const item of section.items || []) {
        if (item.href) {
          const slug = item.href.split('/').pop()
          if (slug) {
            const keywords = extractKeywords(item.label, item.synonyme)
            if (keywords.length > 0) keywordMap[slug] = keywords
          }
        }

        for (const child of item.items || []) {
          if (child.href) {
            const childSlug = child.href.split('/').pop()
            if (childSlug) {
              const keywords = extractKeywords(child.label, child.synonyme)
              if (keywords.length > 0) keywordMap[childSlug] = keywords
            }
          }
        }
      }
    }

    return Object.keys(keywordMap).length > 0 ? keywordMap : FALLBACK_CATEGORY_KEYWORDS
  } catch (error) {
    console.error('Failed to fetch category keywords from Directus:', error)
    return FALLBACK_CATEGORY_KEYWORDS
  }
}

/**
 * All `/vintage/*` content pages for `sitemap.ts`. Two sources, merged and
 * deduped: `navigations_items.href` (covers brand hub pages like
 * `/vintage/adidas` and every `category_pages` entry via its `nav_item`
 * relation) and `brands.href` (a standalone collection — e.g. the Hummel
 * brand page — that isn't guaranteed to also have a `navigations_items`
 * row). Deliberately excludes `brand_pages` (the brand×category templates,
 * e.g. `/vintage/nike/hosen/anzughosen`) — most of those combinations
 * currently show 0 products, and a sitemap full of empty pages does more
 * harm than good (Sebastian's call, see the sitemap plan).
 */
export async function getSitemapVintageUrls(): Promise<string[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  const urls = new Set<string>()
  try {
    const navItems = await client.request<Array<{ href: string | null }>>(
      readItems('navigations_items', {
        filter: { href: { _nnull: true } } as unknown as Record<string, unknown>,
        fields: ['href'],
        limit: -1,
      })
    )
    navItems.forEach((item) => item.href && urls.add(item.href))
  } catch (error) {
    console.error('Failed to fetch navigations_items for sitemap:', error)
  }
  try {
    const brands = await client.request<Array<{ href: string | null }>>(
      readItems('brands', { fields: ['href'], limit: -1 })
    )
    brands.forEach((brand) => brand.href && urls.add(brand.href))
  } catch (error) {
    console.error('Failed to fetch brands for sitemap:', error)
  }
  return Array.from(urls)
}

/** Published guide URLs for `sitemap.ts` — `guide.slug` is always the
 * correct, directly-resolvable path (same value `getGuideBySlug`,
 * `RatgeberHeroSection`, `GuideCard`, and `canonicalUrl` already use). */
export async function getSitemapGuideUrls(): Promise<string[]> {
  if (!directusUrl) return []
  const client = getDirectusClient()
  try {
    const guides = await client.request<Array<{ slug: string }>>(
      readItems('guides', {
        filter: { status: { _eq: 'published' } } as unknown as Record<string, unknown>,
        fields: ['slug'],
        limit: -1,
      })
    )
    return guides.map((guide) => `/ratgeber/${guide.slug}`)
  } catch (error) {
    console.error('Failed to fetch guides for sitemap:', error)
    return []
  }
}

/**
 * All `/ratgeber/*` category URLs for `sitemap.ts`. `guide_categories.slug`
 * data is inconsistent — some values already embed a path prefix as
 * literal data (e.g. `marken/stone-island-vintage-guide`,
 * `vintage-shops/muenster`), others are bare leaf slugs (e.g.
 * `jeansjacke`) that need their full ancestor chain prepended. Same rule
 * as the `CategoryTreeNode.tsx` sidebar fix (confirmed live against
 * several nesting depths), reimplemented here as a plain tree walk instead
 * of reusing the React component.
 */
export async function getSitemapGuideCategoryUrls(): Promise<string[]> {
  const categories = await getGuideCategories()
  const tree = buildCategoryTree(categories)
  const urls: string[] = []

  function walk(nodes: GuideCategory[], ancestorPath: string) {
    for (const node of nodes) {
      const path = node.slug.includes('/')
        ? node.slug
        : ancestorPath
          ? `${ancestorPath}/${node.slug}`
          : node.slug
      urls.push(`/ratgeber/${path}`)
      if (node.children && node.children.length > 0) {
        walk(node.children, path)
      }
    }
  }

  walk(tree, '')
  return urls
}
