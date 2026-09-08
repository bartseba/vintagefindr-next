import { requireVendorAuth } from '@/lib/auth/session'
import { VendorActivitiesView, type ActivityItem } from '@/components/vendor/VendorActivitiesView'

interface ImpressionTrend {
  date: string
  impressions: number
}

export default async function VendorActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; days?: string; page?: string }>
}) {
  const { supabase, vendor } = await requireVendorAuth()
  const params = await searchParams

  const filterType = params.type || 'all'
  const filterDays = params.days || '30'
  const page = parseInt(params.page || '1')
  const perPage = 50

  const activities: ActivityItem[] = []

  const daysAgo = parseInt(filterDays) === 0 ? 365 : parseInt(filterDays)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)

  if (filterType === 'all' || filterType === 'products') {
    const { data: products } = await supabase
      .from('products')
      .select('id, title, created_at, updated_at')
      .eq('vendor_id', vendor.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (products) {
      products.forEach((product) => {
        activities.push({
          id: `product_added_${product.id}`,
          type: 'product_added',
          message: `Produkt "${product.title}" hinzugefügt`,
          time: new Date(product.created_at).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          timestamp: new Date(product.created_at).getTime(),
        })

        if (product.updated_at && product.updated_at !== product.created_at) {
          const updateDate = new Date(product.updated_at)
          if (updateDate >= startDate) {
            activities.push({
              id: `product_updated_${product.id}_${product.updated_at}`,
              type: 'product_updated',
              message: `Produkt "${product.title}" aktualisiert`,
              time: updateDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }),
              timestamp: updateDate.getTime(),
            })
          }
        }
      })
    }
  }

  if (filterType === 'all' || filterType === 'clicks') {
    const { data: clicks } = await supabase
      .from('product_clicks')
      .select('id, product_id, clicked_at, products(title)')
      .eq('vendor_id', vendor.id)
      .gte('clicked_at', startDate.toISOString())
      .order('clicked_at', { ascending: false })

    if (clicks) {
      const clicksByDay = new Map<string, { count: number; date: Date }>()

      clicks.forEach((click) => {
        const clickDate = new Date(click.clicked_at)
        const dayKey = clickDate.toLocaleDateString('de-DE')

        if (clicksByDay.has(dayKey)) {
          clicksByDay.get(dayKey)!.count++
        } else {
          clicksByDay.set(dayKey, { count: 1, date: clickDate })
        }
      })

      clicksByDay.forEach((day, dayKey) => {
        activities.push({
          id: `click_${dayKey}`,
          type: 'click',
          message: `${day.count} ${day.count === 1 ? 'Klick' : 'Klicks'} auf Ihre Produkte`,
          time: dayKey,
          timestamp: day.date.getTime(),
        })
      })
    }
  }

  if (filterType === 'all' || filterType === 'packages') {
    const { data: packages } = await supabase
      .from('vendor_payment_packages')
      .select('id, package_name, purchased_at')
      .eq('vendor_id', vendor.id)
      .gte('purchased_at', startDate.toISOString())
      .order('purchased_at', { ascending: false })

    if (packages) {
      packages.forEach((pkg) => {
        activities.push({
          id: `package_${pkg.id}`,
          type: 'package_purchased',
          message: `Paket "${pkg.package_name}" gebucht`,
          time: new Date(pkg.purchased_at).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          timestamp: new Date(pkg.purchased_at).getTime(),
        })
      })
    }
  }

  if (filterType === 'all' || filterType === 'impressions') {
    const endDate = new Date()
    const { data: impressionTrends } = await supabase
      .rpc('get_vendor_impression_trends', {
        p_vendor_id: vendor.id,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
      })

    if (impressionTrends) {
      (impressionTrends as ImpressionTrend[]).forEach((trend) => {
        if (trend.impressions > 0) {
          activities.push({
            id: `impression_${trend.date}`,
            type: 'impression',
            message: `${trend.impressions} ${trend.impressions === 1 ? 'Ansicht' : 'Ansichten'} Ihrer Produkte`,
            time: new Date(trend.date).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            timestamp: new Date(trend.date).getTime(),
          })
        }
      })
    }
  }

  activities.sort((a, b) => b.timestamp - a.timestamp)

  const totalActivities = activities.length
  const totalPages = Math.ceil(totalActivities / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const paginatedActivities = activities.slice(startIndex, endIndex)

  return (
    <VendorActivitiesView
      activities={paginatedActivities}
      totalActivities={totalActivities}
      currentPage={page}
      totalPages={totalPages}
      filterType={filterType}
      filterDays={filterDays}
    />
  )
}
