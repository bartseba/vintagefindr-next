import { requireVendorAuth } from '@/lib/auth/session'
import { VendorAnalyticsView, type VendorAnalytics } from '@/components/vendor/VendorAnalyticsView'

function formatDe(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function subDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000)
}

interface ProductClickRow {
  ip_hash: string | null
  clicked_at: string
  user_agent: string | null
  products: { title: string } | null
}

export default async function VendorAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { supabase, vendor } = await requireVendorAuth()
  const params = await searchParams

  const monthlyClickGoal = vendor.monthly_click_goal || 2000
  const ctrGoal = vendor.ctr_goal || 5.0

  const daysBack = parseInt(params.range || '30')
  const endDate = new Date()
  const startDate = subDays(endDate, daysBack)

  let analytics: VendorAnalytics = {
    totalClicks: 0,
    uniqueClicks: 0,
    ctr: 0,
    impressions: 0,
    topProducts: [],
    clickTrends: [],
    deviceBreakdown: { desktop: 0, mobile: 0 },
    goals: {
      monthlyClicks: { current: 0, target: monthlyClickGoal, percentage: 0 },
      conversionRate: { current: 0, target: ctrGoal, percentage: 0 },
    },
    dateRange: {
      start: formatDe(startDate),
      end: formatDe(endDate),
      days: daysBack,
    },
  }

  try {
    const { data: productClicks } = await supabase
      .from('product_clicks')
      .select(`
        *,
        products!inner(title, price, vendor_id)
      `)
      .eq('vendor_id', vendor.id)
      .gte('clicked_at', startDate.toISOString())
      .lte('clicked_at', endDate.toISOString())
      .order('clicked_at', { ascending: false })

    const clickoutData = (productClicks || []) as unknown as ProductClickRow[]

    const totalClicks = clickoutData.length
    const uniqueClicks = new Set(clickoutData.map((c) => c.ip_hash)).size

    const { data: impressionsData } = await supabase
      .from('product_impressions')
      .select('id')
      .eq('vendor_id', vendor.id)
      .gte('viewed_at', startDate.toISOString())
      .lte('viewed_at', endDate.toISOString())

    const totalImpressions = impressionsData?.length || 0
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    const productClickCounts = new Map<string, number>()
    clickoutData.forEach((clickout) => {
      const productTitle = clickout.products?.title || 'Unknown Product'
      productClickCounts.set(productTitle, (productClickCounts.get(productTitle) || 0) + 1)
    })

    const topProducts = Array.from(productClickCounts.entries())
      .map(([name, clicks]) => ({
        name,
        clicks,
        // placeholder trend indicator — the Remix original has the same "would need historical data for real change" gap, ported as-is
        change: Math.floor(Math.random() * 40) - 20,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)

    const clicksByDay = new Map<string, number>()
    for (let i = daysBack - 1; i >= 0; i--) {
      clicksByDay.set(dayKey(subDays(endDate, i)), 0)
    }

    clickoutData.forEach((clickout) => {
      const key = dayKey(new Date(clickout.clicked_at))
      if (clicksByDay.has(key)) {
        clicksByDay.set(key, (clicksByDay.get(key) || 0) + 1)
      }
    })

    const clickTrends = Array.from(clicksByDay.entries()).map(([date, clicks]) => ({
      date: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }),
      clicks,
    }))

    const mobileClicks = clickoutData.filter((c) =>
      c.user_agent && c.user_agent.toLowerCase().includes('mobile')
    ).length
    const desktopClicks = totalClicks - mobileClicks

    const deviceBreakdown = {
      desktop: totalClicks > 0 ? Math.round((desktopClicks / totalClicks) * 100) : 50,
      mobile: totalClicks > 0 ? Math.round((mobileClicks / totalClicks) * 100) : 50,
    }

    const monthlyClicks = daysBack >= 30 ? totalClicks : Math.round(totalClicks * (30 / daysBack))
    const monthlyPercentage = Math.min(Math.round((monthlyClicks / monthlyClickGoal) * 100), 100)
    const conversionPercentage = Math.min(Math.round((ctr / ctrGoal) * 100), 100)

    analytics = {
      totalClicks,
      uniqueClicks,
      ctr: Math.round(ctr * 100) / 100,
      impressions: totalImpressions,
      topProducts,
      clickTrends,
      deviceBreakdown,
      goals: {
        monthlyClicks: { current: monthlyClicks, target: monthlyClickGoal, percentage: monthlyPercentage },
        conversionRate: { current: ctr, target: ctrGoal, percentage: conversionPercentage },
      },
      dateRange: analytics.dateRange,
    }
  } catch (error) {
    console.error('Analytics error:', error)
  }

  return <VendorAnalyticsView analytics={analytics} storeName={vendor.store_name} />
}
