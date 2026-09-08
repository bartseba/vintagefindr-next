import 'server-only'
import { liteClient as algoliasearch } from 'algoliasearch/lite'

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_SEARCH_API_KEY || process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
)

export interface ProductHit {
  objectID: string
  id: string
  title: string
  brand?: string
  category?: string
  price: number
  currency: string
  condition?: string
  vintage_styles?: string
  image_url_1?: string
  vendor_name?: string
  vendor_id?: string
  product_url?: string
  checkout_url?: string
  shipping_cost?: number
  free_shipping_threshold?: number
  delivery_time_min_days?: number
  delivery_time_max_days?: number
  tax_included?: boolean
  tax_rate?: number
}

/**
 * Direct server-side product search, used for the non-interactive hub-page
 * teaser sections (`HubSection`) instead of the full InstantSearch client
 * widget tree. Next.js 16 hard-blocks importing `react-dom/server` anywhere
 * in the Server Component module graph, which is what the Remix app's
 * `getServerState` + `renderToString` SSR pattern relies on — a real
 * InstantSearch-based port needs a different design (deferred to sub-phase
 * 2.2, where actual user-driven refinement/sort/pagination is needed). These
 * teaser sections only ever render a fixed `filterQuery` with no user
 * interaction, so a plain server-side search call is both simpler and a
 * better fit for the App Router than mounting the InstantSearch machinery
 * just to render a static list.
 */
export async function searchProducts(filters: string, hitsPerPage = 12): Promise<ProductHit[]> {
  if (!filters) return []
  try {
    const { results } = await searchClient.searchForHits<ProductHit>({
      requests: [
        {
          indexName: 'products',
          filters,
          hitsPerPage,
        },
      ],
    })
    return results[0]?.hits ?? []
  } catch (error) {
    console.error('Algolia search failed:', error)
    return []
  }
}
