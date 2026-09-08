import { requireAdminAuth } from '@/lib/auth/session'
import { AdminAnalyticsView, type ClickData } from '@/components/admin/AdminAnalyticsView'

interface RawClickRow {
  id: string
  vendor_id: string
  product_id: string
  ip_hash: string | null
  clicked_at: string
  referer: string | null
  user_agent: string | null
  products: { title: string } | null
  vendors: { first_name: string; last_name: string; store_name: string } | null
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string; range?: string; search?: string; page?: string }>
}) {
  const { supabase } = await requireAdminAuth()
  const params = await searchParams

  const vendorFilter = params.vendor || 'all'
  const dateRange = params.range || '30'
  const searchQuery = params.search || ''
  const page = parseInt(params.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const daysBack = parseInt(dateRange)
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000)

  let clicks: ClickData[] = []
  let totalCount = 0
  const stats = {
    totalClicks: 0,
    uniqueIPs: 0,
    topVendors: [] as Array<{ name: string; clicks: number }>,
    clicksInPeriod: 0,
  }
  let vendors: Array<{ id: string; name: string; storeName: string }> = []

  try {
    let countQuery = supabase
      .from('product_clicks')
      .select('*', { count: 'exact', head: true })
      .gte('clicked_at', startDate.toISOString())
      .lte('clicked_at', endDate.toISOString())

    if (vendorFilter !== 'all') {
      countQuery = countQuery.eq('vendor_id', vendorFilter)
    }
    if (searchQuery) {
      countQuery = countQuery.or(`ip_hash.ilike.%${searchQuery}%,referer.ilike.%${searchQuery}%,user_agent.ilike.%${searchQuery}%`)
    }

    const { count } = await countQuery
    totalCount = count || 0

    let dataQuery = supabase
      .from('product_clicks')
      .select(`
        id,
        vendor_id,
        product_id,
        ip_hash,
        clicked_at,
        referer,
        user_agent,
        products!product_clicks_product_id_fkey(
          title
        ),
        vendors!product_clicks_vendor_id_fkey(
          first_name,
          last_name,
          store_name
        )
      `)
      .gte('clicked_at', startDate.toISOString())
      .lte('clicked_at', endDate.toISOString())
      .order('clicked_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (vendorFilter !== 'all') {
      dataQuery = dataQuery.eq('vendor_id', vendorFilter)
    }
    if (searchQuery) {
      dataQuery = dataQuery.or(`ip_hash.ilike.%${searchQuery}%,referer.ilike.%${searchQuery}%,user_agent.ilike.%${searchQuery}%`)
    }

    const { data: clicksData, error: clicksError } = await dataQuery

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError)
    }

    if (clicksData) {
      clicks = (clicksData as unknown as RawClickRow[]).map((click) => {
        const ua = click.user_agent?.toLowerCase() || ''
        const isMobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')

        return {
          id: click.id,
          vendorId: click.vendor_id,
          vendorName: `${click.vendors?.first_name || ''} ${click.vendors?.last_name || ''}`.trim(),
          vendorStoreName: click.vendors?.store_name || 'Unknown',
          productId: click.product_id,
          productTitle: click.products?.title || 'Unknown Product',
          ipHash: click.ip_hash || 'unknown',
          clickedAt: click.clicked_at,
          referer: click.referer,
          userAgent: click.user_agent,
          deviceType: isMobile ? 'mobile' as const : (click.user_agent ? 'desktop' as const : 'unknown' as const),
        }
      })
    }

    const { data: allClicksInPeriod } = await supabase
      .from('product_clicks')
      .select(`
        ip_hash,
        vendor_id,
        vendors!product_clicks_vendor_id_fkey(
          first_name,
          last_name,
          store_name
        )
      `)
      .gte('clicked_at', startDate.toISOString())
      .lte('clicked_at', endDate.toISOString())

    if (allClicksInPeriod) {
      const rows = allClicksInPeriod as unknown as Array<{ ip_hash: string | null; vendor_id: string; vendors: { store_name: string } | null }>
      stats.totalClicks = rows.length
      stats.uniqueIPs = new Set(rows.map((c) => c.ip_hash).filter(Boolean)).size
      stats.clicksInPeriod = rows.length

      const vendorClickCounts = new Map<string, { name: string; clicks: number }>()
      rows.forEach((click) => {
        const storeName = click.vendors?.store_name || 'Unknown'
        const current = vendorClickCounts.get(storeName) || { name: storeName, clicks: 0 }
        vendorClickCounts.set(storeName, { name: storeName, clicks: current.clicks + 1 })
      })

      stats.topVendors = Array.from(vendorClickCounts.values())
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5)
    }

    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('id, first_name, last_name, store_name')
      .eq('status', 'approved')
      .order('store_name', { ascending: true })

    if (vendorsData) {
      vendors = vendorsData.map((v: { id: string; first_name: string; last_name: string; store_name: string }) => ({
        id: v.id,
        name: `${v.first_name} ${v.last_name}`,
        storeName: v.store_name,
      }))
    }
  } catch (error) {
    console.error('Admin analytics error:', error)
  }

  const formatDe = (date: Date) =>
    date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <AdminAnalyticsView
      clicks={clicks}
      totalCount={totalCount}
      currentPage={page}
      totalPages={Math.ceil(totalCount / limit)}
      stats={stats}
      vendors={vendors}
      filters={{ vendor: vendorFilter, range: dateRange, search: searchQuery }}
      dateRange={{ start: formatDe(startDate), end: formatDe(endDate), days: daysBack }}
    />
  )
}
