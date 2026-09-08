import { redirect } from 'next/navigation'

/**
 * Ported from `app/routes/reset-password.tsx`. Supabase's password-reset
 * email link points here; this just bounces to the global modal (either
 * the error state, if the link failed, or the reset-password modal itself,
 * which then validates the session client-side).
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  if (params.error) {
    redirect('/?modal=login&error=' + encodeURIComponent(params.error_description || 'Reset-Link ist ungültig oder abgelaufen'))
  }

  redirect('/?modal=reset-password')
}
