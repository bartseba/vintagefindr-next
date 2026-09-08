import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createHash } from 'crypto'
import { supabasePublic } from '@/lib/supabase/public'
import { GoRedirectClient } from '@/components/GoRedirectClient'

/**
 * Ported from `app/routes/go.$productId.tsx` — the product click-through
 * tracking + redirect route linked from `ProductCard`/`FavoritesDropdown`/
 * `RecentlyViewedSection`/`VendorInfoModal`, missing from every earlier
 * phase of this migration (those components already linked to `/go/${id}`
 * assuming it existed). See the Remix original's own doc comment for the
 * full DSGVO/bot-prevention rationale (IP hashing, 30-min dedup via the
 * `track_product_click` RPC, bot-UA filtering, per-IP rate limiting).
 *
 * Ported as a real Server Component page (not a redirect-only Route
 * Handler) because the interstitial itself is legally meaningful — it
 * shows the "Kauf erfolgt beim Händler" marketplace-liability disclaimer
 * before redirecting, matching the Remix original exactly rather than a
 * silent 302.
 */

interface RawProductRow {
  id: string
  title: string
  product_url: string | null
  vendor_id: string
  is_active: boolean
  deleted: boolean
  vendors: { store_name: string; is_active: boolean; deleted: boolean } | null
}

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java(?!script)/i,
  /go-http-client/i,
  /axios/i,
  /postman/i,
  /insomnia/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /playwright/i,
  /puppeteer/i,
  /facebookexternalhit/i,
]

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true
  if (userAgent.length < 10) return true
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent))
}

const clickRateLimiter = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of clickRateLimiter.entries()) {
    if (now > value.resetAt) {
      clickRateLimiter.delete(key)
    }
  }
}, 60000)

function checkClickRateLimit(ipHash: string | null): boolean {
  if (!ipHash) return false

  const now = Date.now()
  const limit = clickRateLimiter.get(ipHash)

  if (!limit || now > limit.resetAt) {
    clickRateLimiter.set(ipHash, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (limit.count >= 30) {
    console.warn(`[SECURITY] Rate limit exceeded for IP hash: ${ipHash.substring(0, 8)}...`)
    return false
  }

  limit.count++
  return true
}

export default async function GoToProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params

  if (!supabasePublic) {
    notFound()
  }

  const headersList = await headers()
  const referer = headersList.get('referer') || null
  const userAgent = headersList.get('user-agent') || null

  if (isBot(userAgent)) {
    console.warn(`[SECURITY] Bot detected: ${userAgent?.substring(0, 50)}`)

    const { data: product, error } = await supabasePublic
      .from('products')
      .select('id, title, product_url, vendor_id, is_active, deleted, vendors!inner(store_name, is_active, deleted)')
      .eq('id', productId)
      .single<RawProductRow>()

    if (error || !product || !product.product_url) {
      notFound()
    }

    if (!product.is_active || product.deleted || !product.vendors?.is_active || product.vendors?.deleted) {
      notFound()
    }

    return (
      <GoRedirectClient
        targetUrl={product.product_url}
        productTitle={product.title}
        vendorName={product.vendors?.store_name || 'Shop'}
      />
    )
  }

  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const remoteAddress = forwarded?.split(',')[0].trim() || realIp || 'unknown'

  const ipForHashing = remoteAddress !== 'unknown'
    ? remoteAddress
    : (process.env.NODE_ENV === 'development' ? 'localhost' : 'unknown')

  const ipHash = ipForHashing !== 'unknown'
    ? createHash('sha256').update(ipForHashing + (process.env.SESSION_SECRET || 'fallback-salt')).digest('hex')
    : null

  // Remix's original throws a 429 here; the App Router has no clean way for
  // a page component to emit an arbitrary status code (same constraint
  // documented for sub-phase 7.8's admin.suggestions redirect). Degrading
  // to "render normally, skip tracking" instead of a hard error keeps a
  // real rate-limited browser from seeing a broken page, while still
  // blocking the thing the rate limit exists to prevent (RPC/credit-
  // deduction spam) — a deliberate adaptation, not a silent behavior drop.
  const withinRateLimit = checkClickRateLimit(ipHash)

  const { data: product, error } = await supabasePublic
    .from('products')
    .select('id, title, product_url, vendor_id, is_active, deleted, vendors!inner(store_name, is_active, deleted)')
    .eq('id', productId)
    .maybeSingle<RawProductRow>()

  if (error || !product) {
    notFound()
  }

  if (!product.is_active || product.deleted || !product.vendors?.is_active || product.vendors?.deleted) {
    notFound()
  }

  if (!product.product_url) {
    notFound()
  }

  if (withinRateLimit) {
    const { data: trackResult, error: trackError } = await supabasePublic.rpc('track_product_click', {
      p_product_id: product.id,
      p_vendor_id: product.vendor_id,
      p_ip_hash: ipHash,
      p_referer: referer,
      p_user_agent: userAgent,
    })

    if (trackError) {
      console.error('Failed to track click:', trackError)
    } else if (trackResult && !trackResult.success) {
      console.warn('Click tracking failed:', trackResult)
    }
  }

  return (
    <GoRedirectClient
      targetUrl={product.product_url}
      productTitle={product.title}
      vendorName={product.vendors?.store_name || 'Shop'}
    />
  )
}
