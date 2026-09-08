import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.standard, 'request-extension')
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID ist erforderlich' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('request_package_extension', {
      p_package_id: packageId,
    })

    if (error) {
      console.error('Error requesting extension:', error)
      return NextResponse.json({ error: 'Fehler beim Beantragen der Verlängerung' }, { status: 500 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      requestId: data.request_id,
      message: data.message,
    })
  } catch (error) {
    console.error('Error in request-extension:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
