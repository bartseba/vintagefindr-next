import { requireAdminAuth } from '@/lib/auth/session'
import { AdminDsaReportsView, type DsaReportListItem, type DsaReportDetail } from '@/components/admin/AdminDsaReportsView'

export default async function AdminDsaReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>
}) {
  const { supabase } = await requireAdminAuth()
  const params = await searchParams

  const statusFilter = params.status || 'all'
  const viewId = params.view

  let dsaReports: DsaReportListItem[] = []
  let selectedReport: DsaReportDetail | null = null
  const stats = { total: 0, new: 0, under_review: 0, resolved: 0, rejected: 0 }

  try {
    let query = supabase
      .from('dsa_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: reportsData, error } = await query

    if (error) throw error

    dsaReports = reportsData || []

    const { data: allReports } = await supabase.from('dsa_reports').select('status')

    if (allReports) {
      stats.total = allReports.length
      stats.new = allReports.filter((r: { status: string }) => r.status === 'new').length
      stats.under_review = allReports.filter((r: { status: string }) => r.status === 'under_review').length
      stats.resolved = allReports.filter((r: { status: string }) => r.status === 'resolved').length
      stats.rejected = allReports.filter((r: { status: string }) => r.status === 'rejected').length
    }

    if (viewId) {
      const { data: reportData } = await supabase
        .from('dsa_reports')
        .select('*')
        .eq('id', viewId)
        .single()

      selectedReport = reportData
    }
  } catch (error) {
    console.error('Error loading DSA reports:', error)
  }

  return (
    <AdminDsaReportsView
      dsaReports={dsaReports}
      selectedReport={selectedReport}
      stats={stats}
      statusFilter={statusFilter}
    />
  )
}
