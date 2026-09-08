import { NextResponse, type NextRequest } from 'next/server'
import { supabasePublic } from '@/lib/supabase/public'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.strict, 'validate-registration')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, firstName, lastName, username } = await request.json()

    const errors: Record<string, string> = {}

    if (!email) errors.email = 'E-Mail ist erforderlich'
    if (!firstName) errors.firstName = 'Vorname ist erforderlich'
    if (!lastName) errors.lastName = 'Nachname ist erforderlich'

    if (username && supabasePublic) {
      const { data: usernameExists } = await supabasePublic.rpc('check_username_exists', {
        p_username: username,
      })

      if (usernameExists === true) {
        errors.username = 'Benutzername ist bereits vergeben'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    return NextResponse.json({ success: true, email, firstName, lastName, username })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
