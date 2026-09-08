'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client — for use inside Client Components. Ported from
 * app/lib/supabase.client.ts, which exported a module-level singleton with
 * explicit PKCE flow options (needed by the OTP/magic-link auth flow's code
 * exchange in `/auth/callback`) — memoized here the same way, since several
 * auth modals import this independently and creating a fresh
 * `createBrowserClient()` per call triggers Supabase's "Multiple
 * GoTrueClient instances" warning.
 */
let client: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    )
  }
  return client
}
