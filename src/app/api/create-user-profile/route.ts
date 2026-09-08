import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * SECURITY: User Profile Creation API
 * This endpoint is protected - only authenticated users can create their own profile.
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.strict, 'create-user-profile')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Please login first' }, { status: 401 })
    }

    const { userId, email, firstName, lastName, username } = await request.json()

    if (!userId || !email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden - Cannot create profile for another user' }, { status: 403 })
    }

    if (email !== user.email) {
      return NextResponse.json({ error: 'Forbidden - Email mismatch' }, { status: 403 })
    }

    const { data: result, error: rpcError } = await supabase.rpc('create_user_profile', {
      p_user_id: userId,
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_username: username || null,
    })

    if (rpcError) {
      console.error('Profile creation RPC error:', rpcError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    if (!result || !result.success) {
      const errorMessage = result?.error || 'Unknown error'
      console.error('Profile creation failed:', errorMessage)

      if (errorMessage === 'Profile already exists') {
        return NextResponse.json({ error: errorMessage }, { status: 409 })
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
