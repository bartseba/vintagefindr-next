import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase auth session on every request so Server Components
 * always see a valid (non-expired) session. This is the piece Remix's
 * hand-rolled cookie adapter didn't have — @supabase/ssr's official Next.js
 * proxy pattern handles token refresh automatically.
 *
 * (Next.js 16 renamed the "middleware" file convention to "proxy" — this is
 * the new name, not a different mechanism.)
 */
export async function proxy(request: NextRequest) {
  // `/vintage/*` hrefs are always lowercase by convention (Directus CMS
  // data), but a stray uppercase nav-item href (e.g. `/vintage/Hummel`,
  // found via Google indexing a 404) would otherwise hard-404 instead of
  // resolving — Next.js routing is case-sensitive. Redirect any mixed-case
  // `/vintage/*` path to its lowercase canonical form so this class of bug
  // degrades to a redirect instead of a dead link, for every brand/category,
  // not just the one that's been reported.
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/vintage/') && pathname !== pathname.toLowerCase()) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.toLowerCase()
    return NextResponse.redirect(url, 308)
  }

  // Nonce-based CSP, following Next.js's own documented pattern
  // (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
  // — this Next version renamed "middleware" to "proxy" but the mechanism
  // is identical). Enforcing as of Nov 2026 — shipped as Report-Only first
  // because Cloudflare Rocket Loader was rewriting/deferring Next's own
  // script tags (it predates CSP nonces and would likely have stripped
  // them, hydration-breaking the whole site). Verified zero violations in
  // Report-Only mode, then Rocket Loader was disabled on the Cloudflare
  // side — safe to enforce now. `img-src` stays broad (`https:`) rather
  // than an enumerated allowlist — this is a vintage-shop aggregator, so
  // product images legitimately come from however many individual vendors'
  // own image hosts (Shopify CDN, Bunny CDN, and whatever each new partner
  // shop uses), not a fixed, enumerable set.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'
  const supabaseHttpUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseWsUrl = supabaseHttpUrl.replace('https://', 'wss://')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: data: blob:;
    font-src 'self';
    connect-src 'self' https://*.algolia.net https://*.algolianet.com https://insights.algolia.io ${supabaseHttpUrl} ${supabaseWsUrl} https://eu.i.posthog.com https://static.cloudflareinsights.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEYS!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Touches the session so expired tokens get refreshed before Server
  // Components read cookies.
  await supabase.auth.getUser()

  // Security headers on every response.
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  supabaseResponse.headers.set('Content-Security-Policy', cspHeader)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
