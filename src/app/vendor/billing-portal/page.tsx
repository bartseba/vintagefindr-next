import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireVendorAuth } from '@/lib/auth/session'

/**
 * Ported from `vendor.billing-portal.tsx` — a headless route that always
 * redirects, either to the real Stripe billing portal (via the existing
 * `stripe-billing-portal` Supabase Edge Function) or back to the vendor
 * dashboard on failure. Never renders anything itself, matching the
 * Remix original.
 */
export default async function VendorBillingPortalPage() {
  await requireVendorAuth()

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/vendor/login?modal=login')
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
  const returnUrl = `${siteUrl}/vendor/dashboard`

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-billing-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ return_url: returnUrl }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Billing portal error:', errorData)
      throw new Error(errorData.error || 'Failed to create billing portal session')
    }

    const data = await response.json()

    if (data.url) {
      redirect(data.url)
    }

    throw new Error('No billing portal URL returned')
  } catch (error) {
    // `redirect()` unwinds via a thrown object carrying this digest — must be re-thrown, not treated as a real error
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Error creating billing portal session:', error)
    redirect('/vendor/dashboard?error=billing-portal-failed')
  }
}
