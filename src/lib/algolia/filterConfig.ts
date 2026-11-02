export function buildConfigure({ brand, tags }: { brand?: string; tags?: string[] }): string[][] {
  const facetFilters: string[][] = []
  if (brand) facetFilters.push([`brand:${brand}`])
  if (tags?.length) {
    facetFilters.push(tags.map((t) => `tags:"${t}"`))
  }
  return facetFilters
}

/**
 * Derives an Algolia `filters` string from URL slug segments.
 * Strips "vintage" and known brand slugs, capitalizes the rest,
 * and joins them as OR conditions on the `category` field.
 * Returns undefined when no category segments remain (e.g. brand-root pages).
 */
const SPECIAL_SLUGS = new Set(['neuester-drop', 'sale', 'new', 'alle'])

/**
 * Maps URL slugs to one or more Algolia `category` field values.
 * A slug without an entry here falls back to the slug itself as the category value.
 */
export const SLUG_CATEGORY_MAP: Record<string, string[]> = {
  'pullover': ['pullover', 'hoodie', 'sweatshirt'],
  // 'hosen': ['hosen', 'shorts', 'jeans'],
}

export function buildCategoryFilter(slug: string[], brandHrefs: string[]): string | undefined {
  const brandSet = new Set(brandHrefs.map((b) => b.toLowerCase()))
  const categorySegments = slug.filter(
    (s) => s !== 'vintage' && !brandSet.has(s) && !SPECIAL_SLUGS.has(s)
  )
  if (categorySegments.length === 0) return undefined

  const allCategories = categorySegments.flatMap(
    (s) => SLUG_CATEGORY_MAP[s] ?? [s]
  )
  return allCategories.map((c) => `category:"${c}"`).join(' OR ')
}
