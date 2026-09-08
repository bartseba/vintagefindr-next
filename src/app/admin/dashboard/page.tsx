import { requireAdminAuth } from '@/lib/auth/session'
import { AdminDashboardView, type AdminDashboardData } from '@/components/admin/AdminDashboardView'

interface VendorRow {
  id: string
  first_name: string
  last_name: string
  store_name: string
  email: string
  status: string
  created_at: string
  store_location: string | null
}

interface ProductRow {
  id: string
  title: string
  price: number
  is_active: boolean
  vendors: { store_name: string; status: string } | null
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdminAuth()

  let dashboardData: AdminDashboardData = {
    stats: {
      totalVendors: 0,
      pendingVendors: 0,
      approvedVendors: 0,
      totalProducts: 0,
      activeProducts: 0,
      totalClicks: 0,
      totalUsers: 0,
      monthlyRevenue: 0,
      pendingSuggestions: 0,
      newDsaReports: 0,
      pendingExtensionRequests: 0,
    },
    recentVendors: [],
    topProducts: [],
    recentActivity: [],
    vendorApplications: [],
    systemHealth: {
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%',
    },
  }

  try {
    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false })

    const vendorList = (vendors || []) as VendorRow[]
    const totalVendors = vendorList.length
    const pendingVendors = vendorList.filter((v) => v.status === 'pending').length
    const approvedVendors = vendorList.filter((v) => v.status === 'approved').length

    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        vendors!inner(store_name, status)
      `)

    const productList = (products || []) as unknown as ProductRow[]
    const totalProducts = productList.length
    const activeProducts = productList.filter((p) => p.is_active).length

    const { data: clickouts } = await supabase
      .from('clickouts')
      .select('*')

    const totalClicks = clickouts?.length || 0

    const [brandSuggestions, categorySuggestions, sizeSuggestions] = await Promise.all([
      supabase.from('brand_suggestions').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('category_suggestions').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('size_suggestions').select('id', { count: 'exact' }).eq('status', 'pending'),
    ])

    const pendingSuggestions = (brandSuggestions.count || 0) + (categorySuggestions.count || 0) + (sizeSuggestions.count || 0)

    const { count: newDsaReports } = await supabase
      .from('dsa_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')

    const { count: pendingExtensionRequests } = await supabase
      .from('package_extension_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const productClickCounts = new Map<string, number>()
    if (clickouts) {
      clickouts.forEach((clickout: { product_id: string }) => {
        productClickCounts.set(clickout.product_id, (productClickCounts.get(clickout.product_id) || 0) + 1)
      })
    }

    const topProducts = productList
      .map((product) => ({
        id: product.id,
        title: product.title,
        vendorName: product.vendors?.store_name || 'Unknown',
        price: product.price,
        clicks: productClickCounts.get(product.id) || 0,
        status: product.is_active ? 'active' : 'inactive',
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    const recentVendors = vendorList.slice(0, 5).map((vendor) => ({
      id: vendor.id,
      name: `${vendor.first_name} ${vendor.last_name}`,
      storeName: vendor.store_name,
      email: vendor.email,
      status: vendor.status,
      createdAt: vendor.created_at,
      location: vendor.store_location,
    }))

    // Mock data — matches the Remix original's own placeholder ("mock data for now")
    const recentActivity = [
      {
        id: '1',
        action: 'Vendor approved',
        target: 'Vintage Store München',
        admin: 'Admin',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        action: 'Product flagged',
        target: 'Vintage Kleid 70er',
        admin: 'Admin',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ]

    dashboardData = {
      stats: {
        totalVendors,
        pendingVendors,
        approvedVendors,
        totalProducts,
        activeProducts,
        totalClicks,
        totalUsers: totalVendors + 50,
        monthlyRevenue: totalClicks * 0.5,
        pendingSuggestions,
        newDsaReports: newDsaReports || 0,
        pendingExtensionRequests: pendingExtensionRequests || 0,
      },
      recentVendors,
      topProducts,
      recentActivity,
      vendorApplications: vendorList
        .filter((v) => v.status === 'pending')
        .map((v) => ({
          id: v.id,
          store_name: v.store_name,
          first_name: v.first_name,
          last_name: v.last_name,
          email: v.email,
          created_at: v.created_at,
        })),
      systemHealth: dashboardData.systemHealth,
    }
  } catch (error) {
    console.error('Admin dashboard error:', error)
  }

  return <AdminDashboardView dashboardData={dashboardData} />
}
