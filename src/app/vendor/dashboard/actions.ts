'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Ported from `vendor.dashboard.tsx`'s `action` (`_action=logout`) — the
 * real logout path, submitted via the header's `<Form method="post">`.
 * The component's own client-side `handleLogout` function is dead code
 * (defined, never wired to an `onClick` anywhere) — the opposite of the
 * regular-user dashboard's logout in Phase 5, where the client-side path
 * was the live one. Verified independently rather than assumed.
 */
export async function logoutVendor() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[LOGOUT] Error during signOut:', error)
  }

  redirect('/')
}
