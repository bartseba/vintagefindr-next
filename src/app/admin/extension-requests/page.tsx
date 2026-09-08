import { requireAdminAuth } from '@/lib/auth/session'
import { AdminExtensionRequestsView, type ExtensionRequestItem } from '@/components/admin/AdminExtensionRequestsView'

interface RawExtensionRequest {
  id: string
  package_id: string
  vendor_id: string
  requested_at: string
  status: string
  processed_at: string | null
  admin_notes: string | null
  extended_until: string | null
  vendor: {
    store_name: string
    first_name: string
    last_name: string
    email: string
  }
  package: {
    package_name: string
    clicks_total: number
    clicks_remaining: number
    clicks_used: number
    valid_until: string
    status: string
  }
}

export default async function AdminExtensionRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { supabase } = await requireAdminAuth()
  const params = await searchParams

  const statusFilter = params.status || 'pending'

  let extensionRequests: ExtensionRequestItem[] = []
  const stats = { total: 0, pending: 0, approved: 0, rejected: 0 }

  try {
    let query = supabase
      .from('package_extension_requests')
      .select(`
        id,
        package_id,
        vendor_id,
        requested_at,
        status,
        processed_at,
        admin_notes,
        extended_until,
        vendor:vendors!vendor_id (
          store_name,
          first_name,
          last_name,
          email
        ),
        package:vendor_payment_packages!package_id (
          package_name,
          clicks_total,
          clicks_remaining,
          clicks_used,
          valid_until,
          status
        )
      `)
      .order('requested_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data: requestsData, error } = await query

    if (error) throw error

    if (requestsData) {
      extensionRequests = (requestsData as unknown as RawExtensionRequest[]).map((req) => ({
        id: req.id,
        packageId: req.package_id,
        vendorId: req.vendor_id,
        requestedAt: req.requested_at,
        status: req.status,
        processedAt: req.processed_at,
        adminNotes: req.admin_notes,
        extendedUntil: req.extended_until,
        vendor: {
          storeName: req.vendor.store_name,
          firstName: req.vendor.first_name,
          lastName: req.vendor.last_name,
          email: req.vendor.email,
        },
        package: {
          packageName: req.package.package_name,
          clicksTotal: req.package.clicks_total,
          clicksRemaining: req.package.clicks_remaining,
          clicksUsed: req.package.clicks_used,
          validUntil: req.package.valid_until,
          status: req.package.status,
        },
      }))
    }

    const { count: totalCount } = await supabase
      .from('package_extension_requests')
      .select('*', { count: 'exact', head: true })
    stats.total = totalCount || 0

    const { count: pendingCount } = await supabase
      .from('package_extension_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    stats.pending = pendingCount || 0

    const { count: approvedCount } = await supabase
      .from('package_extension_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    stats.approved = approvedCount || 0

    const { count: rejectedCount } = await supabase
      .from('package_extension_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
    stats.rejected = rejectedCount || 0
  } catch (error) {
    console.error('Error fetching extension requests:', error)
  }

  return (
    <AdminExtensionRequestsView
      extensionRequests={extensionRequests}
      stats={stats}
      filters={{ status: statusFilter }}
    />
  )
}
