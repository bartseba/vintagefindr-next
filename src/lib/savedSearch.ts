/**
 * Saved searches ("Such-Alerts"): pure helpers shared by the save button,
 * the API route and the daily digest cron. No I/O in here so it stays
 * unit-testable.
 */

export const MAX_SAVED_SEARCHES_PER_USER = 10
export const MAX_HITS_PER_SEARCH_IN_EMAIL = 6

/** Facets the search UI lets buyers refine on and that we persist. */
export const SAVED_REFINEMENT_ATTRIBUTES = ['brand', 'size', 'gender', 'condition', 'vendor_name', 'category'] as const
type RefinementAttribute = (typeof SAVED_REFINEMENT_ATTRIBUTES)[number]

export type SavedRefinements = Partial<Record<RefinementAttribute, string[]>>

export interface SavedSearchInput {
  label: string
  query: string
  refinements: SavedRefinements
  price_min: number | null
  price_max: number | null
  base_filters: string | null
  base_facet_filters: string[][]
  result_path: string
}

export interface SavedSearchRow extends SavedSearchInput {
  id: string
  user_id: string
  is_active: boolean
  unsubscribe_token: string
  last_notified_at: string
  created_at: string
}

/** Subset of InstantSearch's per-index UI state that we read. */
export interface IndexUiStateLike {
  query?: string
  refinementList?: Record<string, string[] | undefined>
  range?: Record<string, string | undefined>
}

export interface SearchPageContext {
  /** Algolia `filters` string the page is scoped to (hub/category pages). */
  baseFilters?: string | null
  /** Algolia `facetFilters` the page is scoped to (brand pages). */
  baseFacetFilters?: string[][]
  /** Current path + query string, used as "alle Treffer ansehen" link. */
  resultPath: string
  /** Human label for the page context, e.g. "Jacken" or "Carhartt". */
  pageLabel?: string | null
}

function parseRange(value: string | undefined): { min: number | null; max: number | null } {
  if (!value) return { min: null, max: null }
  const [rawMin, rawMax] = value.split(':')
  const min = rawMin ? Number(rawMin) : NaN
  const max = rawMax ? Number(rawMax) : NaN
  return {
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
  }
}

function buildLabel(query: string, refinements: SavedRefinements, priceMax: number | null, pageLabel?: string | null) {
  const parts: string[] = []
  if (query) parts.push(query)
  if (pageLabel && !query.toLowerCase().includes(pageLabel.toLowerCase())) parts.push(pageLabel)
  for (const attr of ['brand', 'category', 'size', 'gender', 'condition'] as const) {
    const values = refinements[attr]
    if (values?.length) parts.push(values.join('/'))
  }
  if (priceMax != null) parts.push(`bis ${priceMax} €`)
  return parts.join(' · ').slice(0, 120) || 'Gespeicherte Suche'
}

/** Whether the current UI state is specific enough to be worth saving. */
export function isSavable(state: IndexUiStateLike, context?: Pick<SearchPageContext, 'baseFilters' | 'baseFacetFilters'>) {
  const hasQuery = Boolean(state.query?.trim())
  const hasRefinement = SAVED_REFINEMENT_ATTRIBUTES.some((a) => (state.refinementList?.[a]?.length ?? 0) > 0)
  const hasPrice = Boolean(state.range?.price)
  const hasPageScope = Boolean(context?.baseFilters) || (context?.baseFacetFilters?.length ?? 0) > 0
  return hasQuery || hasRefinement || hasPrice || hasPageScope
}

export function fromUiState(state: IndexUiStateLike, context: SearchPageContext): SavedSearchInput {
  const query = (state.query ?? '').trim().slice(0, 200)
  const refinements: SavedRefinements = {}
  for (const attr of SAVED_REFINEMENT_ATTRIBUTES) {
    const values = state.refinementList?.[attr]?.filter(Boolean)
    if (values?.length) refinements[attr] = [...values].sort()
  }
  const { min, max } = parseRange(state.range?.price)
  return {
    label: buildLabel(query, refinements, max, context.pageLabel),
    query,
    refinements,
    price_min: min,
    price_max: max,
    base_filters: context.baseFilters || null,
    base_facet_filters: context.baseFacetFilters ?? [],
    result_path: context.resultPath,
  }
}

/** Validates and normalises an untrusted request body into a SavedSearchInput. */
export function parseSavedSearchInput(body: unknown): SavedSearchInput | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

  const resultPath = str(b.result_path, 1000)
  // Only same-site relative paths, never an external URL.
  if (!resultPath.startsWith('/') || resultPath.startsWith('//')) return null

  const refinements: SavedRefinements = {}
  const rawRefinements = (b.refinements ?? {}) as Record<string, unknown>
  for (const attr of SAVED_REFINEMENT_ATTRIBUTES) {
    const values = rawRefinements[attr]
    if (Array.isArray(values)) {
      const clean = values.filter((v): v is string => typeof v === 'string' && v.length > 0).map((v) => v.slice(0, 100))
      if (clean.length) refinements[attr] = clean.slice(0, 20).sort()
    }
  }

  const baseFacetFilters = Array.isArray(b.base_facet_filters)
    ? (b.base_facet_filters as unknown[])
        .filter(Array.isArray)
        .map((group) => (group as unknown[]).filter((v): v is string => typeof v === 'string').map((v) => v.slice(0, 200)))
        .filter((group) => group.length > 0)
        .slice(0, 10)
    : []

  return {
    label: str(b.label, 120) || 'Gespeicherte Suche',
    query: str(b.query, 200).trim(),
    refinements,
    price_min: num(b.price_min),
    price_max: num(b.price_max),
    base_filters: str(b.base_filters, 1000) || null,
    base_facet_filters: baseFacetFilters,
    result_path: resultPath,
  }
}

/** Stable key so the same search is not saved twice by one user. */
export function savedSearchKey(s: Pick<SavedSearchInput, 'query' | 'refinements' | 'price_min' | 'price_max' | 'base_filters' | 'base_facet_filters'>) {
  const refinements = Object.fromEntries(
    Object.entries(s.refinements ?? {})
      .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
      .map(([k, v]): [string, string[]] => [k, [...v].sort()])
      .sort(([a], [b]) => a.localeCompare(b))
  )
  return JSON.stringify([
    s.query.trim().toLowerCase(),
    refinements,
    s.price_min,
    s.price_max,
    s.base_filters ?? null,
    s.base_facet_filters ?? [],
  ])
}

// facetFilters take the raw value after the first colon - no quoting needed
// (unlike the `filters` string syntax).
function quoteFacetValue(attr: string, value: string) {
  return `${attr}:${value}`
}

export interface AlgoliaSearchParams {
  query: string
  facetFilters?: string[][]
  numericFilters?: string[]
  filters?: string
}

export function toAlgoliaParams(s: Pick<SavedSearchInput, 'query' | 'refinements' | 'price_min' | 'price_max' | 'base_filters' | 'base_facet_filters'>): AlgoliaSearchParams {
  const facetFilters: string[][] = [...(s.base_facet_filters ?? [])]
  for (const attr of SAVED_REFINEMENT_ATTRIBUTES) {
    const values = s.refinements[attr]
    if (values?.length) facetFilters.push(values.map((v) => quoteFacetValue(attr, v)))
  }
  const numericFilters: string[] = []
  if (s.price_min != null) numericFilters.push(`price>=${s.price_min}`)
  if (s.price_max != null) numericFilters.push(`price<=${s.price_max}`)

  const params: AlgoliaSearchParams = { query: s.query }
  if (facetFilters.length) params.facetFilters = facetFilters
  if (numericFilters.length) params.numericFilters = numericFilters
  if (s.base_filters) params.filters = s.base_filters
  return params
}

export interface AlertHit {
  objectID: string
  id?: string
  title?: string
  brand?: string
  price?: number
  currency?: string
  size?: string
  image_url_1?: string
  vendor_name?: string
  created_at?: string
  is_active?: boolean
}

/** Only active items listed after `since`, newest first, capped for the email. */
export function pickNewHits<T extends AlertHit>(hits: T[], since: string, limit = MAX_HITS_PER_SEARCH_IN_EMAIL): T[] {
  const sinceMs = Date.parse(since)
  if (!Number.isFinite(sinceMs)) return []
  return hits
    .filter((h) => h.is_active !== false)
    .filter((h) => {
      const created = h.created_at ? Date.parse(h.created_at) : NaN
      return Number.isFinite(created) && created > sinceMs
    })
    .sort((a, b) => Date.parse(b.created_at!) - Date.parse(a.created_at!))
    .slice(0, limit)
}
