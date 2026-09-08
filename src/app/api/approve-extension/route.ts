import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { logAuditWithRequest } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.standard, 'approve-extension')
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
    const { requestId, adminNotes } = body

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID ist erforderlich' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('approve_package_extension', {
      p_request_id: requestId,
      p_admin_notes: adminNotes || null,
    })

    if (error) {
      console.error('Error approving extension:', error)
      return NextResponse.json({ error: 'Fehler beim Genehmigen der Verlängerung' }, { status: 500 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    await logAuditWithRequest({
      userId: user.id,
      userEmail: user.email || '',
      actionType: 'approve',
      resourceType: 'extension',
      resourceId: requestId,
      oldValue: { status: 'pending' },
      newValue: { status: 'approved', adminNotes, newValidUntil: data.new_valid_until },
    })

    return NextResponse.json({
      success: true,
      message: data.message,
      newValidUntil: data.new_valid_until,
    })
  } catch (error) {
    console.error('Error in approve-extension:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
