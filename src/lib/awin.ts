/**
 * Awin tracking links are baked directly into a product's `product_url` at
 * import time (e.g. awin1.com/pclick.php?p=...&a=...&m=...) — this is the
 * shared check for "is this product_url an Awin deeplink", used both to
 * append the Awin consent signal on redirect (GoRedirectClient) and to
 * conditionally hide UI for Awin products (e.g. the "Händlerinfo" link).
 */
export function isAwinUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    return new URL(url).hostname.endsWith('awin1.com')
  } catch {
    return false
  }
}
