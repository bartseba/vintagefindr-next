import { NextResponse, type NextRequest } from 'next/server'
import { uploadImageToBunny } from '@/lib/bunny-cdn'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * SECURITY: Image Upload API
 * This endpoint is protected and requires authentication.
 * Only authenticated vendors and admins can upload images.
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.standard, 'upload-image')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Please login' }, { status: 401 })
    }

    const { data: isAdminResult } = await supabase.rpc('is_admin', { user_uuid: user.id })
    const isAdmin = isAdminResult === true

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .eq('deleted', false)
      .maybeSingle()

    const isVendor = !!vendor

    if (!isAdmin && !isVendor) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden - Only vendors and admins can upload images'
      }, { status: 403 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const folder = (formData.get('folder') as string) || 'products'

    if (!imageFile) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 })
    }

    const result = await uploadImageToBunny(imageFile, folder)

    if (result.success) {
      return NextResponse.json({ success: true, url: result.url })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 })
  }
}
