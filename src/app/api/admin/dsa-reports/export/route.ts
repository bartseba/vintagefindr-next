import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/session'
import { logAuditWithRequest } from '@/lib/audit'

/**
 * Ported from `admin.dsa-reports.tsx`'s `action` (`_action=export`
 * branch) as a Route Handler instead of a Server Action — a CSV download
 * needs a real HTTP response with `Content-Disposition: attachment`,
 * which a Server Action's serialized return value can't produce the same
 * way a Remix action's raw `Response` could. Triggered by a plain link
 * navigation, no client JS needed.
 */
export async function GET(request: NextRequest) {
  const { supabase, authUser } = await requireAdminAuth()

  const statusFilter = request.nextUrl.searchParams.get('status') || 'all'

  let query = supabase
    .from('dsa_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: reports } = await query

  if (!reports) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }

  await logAuditWithRequest({
    userId: authUser.id,
    userEmail: authUser.email || '',
    actionType: 'export',
    resourceType: 'dsa_report',
    newValue: { filter: statusFilter, count: reports.length },
  })

  interface DsaReportRow {
    id: string
    status: string
    violation_type: string
    content_url: string
    reporter_name: string
    reporter_email: string
    description: string
    created_at: string
  }

  const csv = [
    ['ID', 'Status', 'Verstoßart', 'Content URL', 'Reporter Name', 'Reporter Email', 'Beschreibung', 'Erstellt am'].join(','),
    ...(reports as DsaReportRow[]).map((r) => [
      r.id,
      r.status,
      r.violation_type,
      `"${r.content_url}"`,
      `"${r.reporter_name}"`,
      r.reporter_email,
      `"${r.description.replace(/"/g, '""')}"`,
      new Date(r.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(r.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    ].join(',')),
  ].join('\n')

  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="dsa-reports-${dateStr}.csv"`,
    },
  })
}
