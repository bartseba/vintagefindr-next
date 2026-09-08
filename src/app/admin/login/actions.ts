'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface AdminLoginState {
  error?: string
}

/**
 * Ported from `admin.login.tsx`'s `action` — the one real password-based
 * sign-in flow in this migration (every other auth flow is OTP). Signs in
 * via the cookie-bound server client directly (not the browser SDK, since
 * this runs server-side to begin with), then checks admin status via the
 * `is_admin()` RPC — matching this route's own Remix source, which uses
 * the RPC here even though `requireAdminAuth`'s guard uses a direct
 * `user_roles` query (see `requireAdminAuth`'s doc comment).
 */
export async function adminSignIn(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-Mail und Passwort sind erforderlich' }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    let errorMsg = error.message
    if (error.message.includes('Invalid login credentials')) {
      errorMsg = 'E-Mail oder Passwort ist falsch'
    } else if (error.message.includes('Email not confirmed')) {
      errorMsg = 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse'
    } else if (error.message.includes('User not found')) {
      errorMsg = 'Benutzer nicht gefunden'
    } else {
      errorMsg = 'Anmeldung fehlgeschlagen: ' + error.message
    }
    return { error: errorMsg }
  }

  if (!data.user) {
    return { error: 'Anmeldung fehlgeschlagen' }
  }

  const { data: isAdminResult } = await supabase.rpc('is_admin', { user_uuid: data.user.id })
  const isAdmin = isAdminResult === true

  if (!isAdmin) {
    await supabase.auth.signOut()
    return { error: 'Keine Admin-Berechtigung' }
  }

  redirect('/admin/dashboard')
}
