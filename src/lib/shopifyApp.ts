import 'server-only'

// Server-to-server calls to the Shopify connect app (connect.vintagefindr.de).
// Its vendorId-based /api/* routes trust the caller to have authenticated
// the vendor already, so every request carries the shared INTERNAL_API_SECRET.
export function getShopifyAppConfigError(): string | null {
  if (!process.env.SHOPIFY_APP_URL) return 'SHOPIFY_APP_URL ist nicht konfiguriert'
  if (!process.env.INTERNAL_API_SECRET) return 'INTERNAL_API_SECRET ist nicht konfiguriert'
  return null
}

export function shopifyAppFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('x-internal-api-key', process.env.INTERNAL_API_SECRET ?? '')
  return fetch(`${process.env.SHOPIFY_APP_URL}${path}`, { ...init, headers, cache: 'no-store' })
}
