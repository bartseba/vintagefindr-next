import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.standard, 'extension-status')
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  try {
    const packageId = request.nextUrl.searchParams.get('packageId')

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID ist erforderlich' }, { status: 400 })
    }

    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!vendorData) {
      return NextResponse.json({ error: 'Vendor nicht gefunden' }, { status: 404 })
    }

    const { data: eligibilityData, error: eligibilityError } = await supabase.rpc(
      'is_package_eligible_for_extension',
      { p_package_id: packageId }
    )

    if (eligibilityError) {
      console.error('Error checking eligibility:', eligibilityError)
      return NextResponse.json({ error: 'Fehler beim Prüfen der Berechtigung' }, { status: 500 })
    }

    const { data: requestData } = await supabase
      .from('package_extension_requests')
      .select('*')
      .eq('package_id', packageId)
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      eligibility: eligibilityData,
      request: requestData,
    })
  } catch (error) {
    console.error('Error in extension-status:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
