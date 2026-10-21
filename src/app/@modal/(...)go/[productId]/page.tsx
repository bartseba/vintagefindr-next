import { notFound } from 'next/navigation'
import { getGoRedirectData } from '@/lib/go-redirect'
import { GoRedirectClient } from '@/components/GoRedirectClient'
import { GoModal } from '@/components/GoModal'

/**
 * Intercepts client-side navigation to `/go/[productId]` (from
 * `ProductCard`/`FavoritesDropdown`/`VendorInfoModal`/`RecentlyViewedSection`,
 * all of which now use `next/link`) and renders it as a modal overlay on
 * top of the current page instead of replacing it. `(...)` intercepts
 * from the app root regardless of how deep the linking page is nested,
 * since ProductCard is used across many different pages/levels.
 *
 * A hard navigation (shared link, refresh, bots) bypasses interception
 * entirely and hits the real `src/app/go/[productId]/page.tsx` instead —
 * both call the same `getGoRedirectData` so tracking/bot-detection behaves
 * identically either way.
 */
export default async function GoModalPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params

  const data = await getGoRedirectData(productId)

  if (!data) {
    notFound()
  }

  return (
    <GoModal>
      <GoRedirectClient
        targetUrl={data.targetUrl}
        productTitle={data.productTitle}
        vendorName={data.vendorName}
      />
    </GoModal>
  )
}
