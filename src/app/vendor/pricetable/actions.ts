'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface CheckoutState {
  error?: string
  checkoutUrl?: string
}

/**
 * Ported from `vendor.pricetable.tsx`'s `action`. Creates a Stripe
 * Checkout session via the existing `stripe-checkout` Supabase Edge
 * Function (external infra, not part of this migration) and returns the
 * checkout URL for the client to navigate to.
 */
export async function createCheckoutSession(_prevState: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const priceId = formData.get('priceId') as string
  if (!priceId) {
    return { error: 'Price ID is required' }
  }

  const supabase = await createSupabaseServerClient()

  // getUser() validates the token against the Supabase Auth server - needed
  // here because this decision (which vendor, is it approved) gates access
  // to an external Bearer-auth call. getSession() alone only reads
  // unverified local cookie data and must not be used for this.
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    return { error: 'Not authenticated' }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }


  const { data: vendor } = await supabase
    .from('vendors')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!vendor || vendor.status !== 'approved') {
    return { error: 'Nur genehmigte Händler können Pakete buchen. Bitte warten Sie auf die Genehmigung durch unser Team.' }
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
      console.log('######### createCheckoutSession ##########', siteUrl, session.access_token)

    const checkoutResponse = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: `${siteUrl}/vendor/dashboard?payment=success`,
        cancel_url: `${siteUrl}/vendor/pricetable?payment=cancelled`,
        mode: 'payment',
      }),
    })

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json()
      console.error('Checkout error:', errorData)
      return { error: errorData.error || 'Failed to create checkout session' }
    }

    const { url } = await checkoutResponse.json()

    return { checkoutUrl: url }
  } catch (error) {
    console.error('Checkout error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
