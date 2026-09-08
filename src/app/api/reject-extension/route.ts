import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { logAuditWithRequest } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.standard, 'reject-extension')
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const { data: isAdminResult } = await supabase.rpc('is_admin', { user_uuid: user.id })
  const isAdmin = isAdminResult === true

  if (!isAdmin) {
    return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { requestId, reason } = body

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID ist erforderlich' }, { status: 400 })
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Begründung ist erforderlich' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('reject_package_extension', {
      p_request_id: requestId,
      p_admin_notes: reason,
    })

    if (error) {
      console.error('Error rejecting extension:', error)
      return NextResponse.json({ error: 'Fehler beim Ablehnen der Verlängerung' }, { status: 500 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    await logAuditWithRequest({
      userId: user.id,
      userEmail: user.email || '',
      actionType: 'reject',
      resourceType: 'extension',
      resourceId: requestId,
      oldValue: { status: 'pending' },
      newValue: { status: 'rejected', reason },
    })

    return NextResponse.json({
      success: true,
      message: data.message,
    })
  } catch (error) {
    console.error('Error in reject-extension:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
