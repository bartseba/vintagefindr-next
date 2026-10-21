import { notFound } from 'next/navigation'
import { getGoRedirectData } from '@/lib/go-redirect'
import { GoRedirectClient } from '@/components/GoRedirectClient'

/**
 * Ported from `app/routes/go.$productId.tsx` — the product click-through
 * tracking + redirect route linked from `ProductCard`/`FavoritesDropdown`/
 * `RecentlyViewedSection`/`VendorInfoModal`, missing from every earlier
 * phase of this migration (those components already linked to `/go/${id}`
 * assuming it existed). See the Remix original's own doc comment for the
 * full DSGVO/bot-prevention rationale (IP hashing, 30-min dedup via the
 * `track_product_click` RPC, bot-UA filtering, per-IP rate limiting) —
 * now shared with the `@modal/(...)go/[productId]` intercepted route in
 * `src/lib/go-redirect.ts`.
 *
 * Ported as a real Server Component page (not a redirect-only Route
 * Handler) because the interstitial itself is legally meaningful — it
 * shows the "Kauf erfolgt beim Händler" marketplace-liability disclaimer
 * before redirecting, matching the Remix original exactly rather than a
 * silent 302. This full page is the fallback for hard navigation (shared
 * links, refresh, bots) — client-side navigation from within the app is
 * intercepted and rendered as a modal overlay instead (see the `@modal`
 * slot), while this page's tracking/bot-detection logic still runs either
 * way since both routes call the same `getGoRedirectData`.
 */
export default async function GoToProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params

  const data = await getGoRedirectData(productId)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <GoRedirectClient
        targetUrl={data.targetUrl}
        productTitle={data.productTitle}
        vendorName={data.vendorName}
      />
    </div>
  )
}
