'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface VendorReviewLoginState {
  error?: string
}

/**
 * Password-based sign-in for a single allowlisted vendor account, used only
 * so app-store reviewers can log in without receiving an email OTP (see
 * OTPModal/VendorLoginForm — every other vendor login is passwordless).
 * Gated on APP_REVIEW_VENDOR_EMAIL so this route can't be used as a
 * password-login bypass for any other vendor: accounts without a password
 * set are rejected by Supabase anyway, but the allowlist check fails fast
 * and avoids leaking which accounts have a password at all.
 */
export async function vendorReviewSignIn(
  _prevState: VendorReviewLoginState,
  formData: FormData
): Promise<VendorReviewLoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-Mail und Passwort sind erforderlich' }
  }

  const allowedEmail = process.env.APP_REVIEW_VENDOR_EMAIL
  if (!allowedEmail || email.toLowerCase() !== allowedEmail.toLowerCase()) {
    return { error: 'E-Mail oder Passwort ist falsch' }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'E-Mail oder Passwort ist falsch' }
  }

  redirect('/vendor/dashboard')
}
