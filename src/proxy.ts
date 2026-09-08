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

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
