import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions.
 *
 * This replaces the two duplicated Remix implementations
 * (app/lib/auth.server.ts and app/lib/supabase.server.ts), which each
 * hand-rolled cookie parsing. @supabase/ssr has first-class Next.js support
 * via next/headers, so there's no custom cookie adapter needed here.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component - safe to ignore when
            // middleware is refreshing the session (see src/middleware.ts).
          }
        },
      },
    }
  )
}

/**
 * Service-role client for privileged server-side operations (admin actions,
 * bypassing RLS). Never expose this client or its key to the browser.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
