import { isAwinUrl } from '@/lib/awin'

/**
 * Tags an outbound product click with UTM parameters so vendors can see
 * VintageFindr traffic and sales in Shopify / Google Analytics.
 *
 * - Awin deeplinks are left untouched: the parameters would land on Awin's
 *   tracking URL, not on the merchant's page.
 * - UTM parameters the vendor already put on their own product URL win —
 *   we only fill in the ones that are missing.
 * - Anything that is not a parseable http(s) URL is passed through as-is.
 */
export const UTM_PARAMS = {
  utm_source: 'vintagefindr',
  utm_medium: 'referral',
  utm_campaign: 'product_click',
} as const

export function withUtm(targetUrl: string): string {
  if (isAwinUrl(targetUrl)) return targetUrl

  let url: URL
  try {
    url = new URL(targetUrl)
  } catch {
    return targetUrl
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return targetUrl

  for (const [key, value] of Object.entries(UTM_PARAMS)) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value)
  }
  return url.toString()
}
