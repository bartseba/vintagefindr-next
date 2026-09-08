import { requireAdminAuth } from '@/lib/auth/session'
import { AdminProductsView, type AdminProductListItem } from '@/components/admin/AdminProductsView'

interface VendorOption {
  id: string
  store_name: string
}

interface ProductRow {
  id: string
  title: string
  brand: string | null
  category: string | null
  price: number
  currency: string | null
  condition: string | null
  is_active: boolean
  image_url_1: string | null
  vendor: string | null
  vendor_id: string
  created_at: string
  updated_at: string
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; vendor?: string; page?: string }>
}) {
  const { supabase } = await requireAdminAuth()
  const params = await searchParams

  const searchQuery = params.search || ''
  const statusFilter = params.status || 'all'
  const vendorFilter = params.vendor || 'all'
  const page = parseInt(params.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let products: AdminProductListItem[] = []
  let totalCount = 0
  let vendors: VendorOption[] = []
  let stats = { total: 0, active: 0, inactive: 0, flagged: 0 }

  try {
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('id, store_name')
      .eq('status', 'approved')
      .order('store_name')

    vendors = vendorsData || []

    let countQuery = supabase.from('products').select('*, vendors!inner(store_name, status)', { count: 'exact', head: true })
    let dataQuery = supabase.from('products').select(`
      *,
      vendors!inner(store_name, status)
    `)

    if (searchQuery) {
      const orFilter = `title.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
      countQuery = countQuery.or(orFilter)
      dataQuery = dataQuery.or(orFilter)
    }

    if (statusFilter === 'active') {
      countQuery = countQuery.eq('is_active', true)
      dataQuery = dataQuery.eq('is_active', true)
    } else if (statusFilter === 'inactive') {
      countQuery = countQuery.eq('is_active', false)
      dataQuery = dataQuery.eq('is_active', false)
    }

    if (vendorFilter !== 'all') {
      countQuery = countQuery.eq('vendor_id', vendorFilter)
      dataQuery = dataQuery.eq('vendor_id', vendorFilter)
    }

    const { count } = await countQuery
    totalCount = count || 0

    const { data: productsData } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (productsData) {
      const rows = productsData as unknown as ProductRow[]
      const productIds = rows.map((p) => p.id)
      const clickoutCounts = new Map<string, number>()

      if (productIds.length > 0) {
        const { data: clickoutData } = await supabase
          .from('clickouts')
          .select('product_id')
          .in('product_id', productIds)

        if (clickoutData) {
          clickoutData.forEach((clickout: { product_id: string }) => {
            const count = clickoutCounts.get(clickout.product_id) || 0
            clickoutCounts.set(clickout.product_id, count + 1)
          })
        }
      }

      products = rows.map((product) => ({
        id: product.id,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        currency: product.currency || 'EUR',
        condition: product.condition,
        isActive: product.is_active,
        imageUrl: product.image_url_1,
        vendorName: product.vendor || 'Unknown',
        vendorId: product.vendor_id,
        clicks: clickoutCounts.get(product.id) || 0,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }))
    }

    const { data: allProducts } = await supabase
      .from('products')
      .select('is_active, availability')

    if (allProducts) {
      stats = {
        total: allProducts.length,
        active: allProducts.filter((p: { is_active: boolean }) => p.is_active).length,
        inactive: allProducts.filter((p: { is_active: boolean }) => !p.is_active).length,
        flagged: 0,
      }
    }
  } catch (error) {
    console.error('Admin products error:', error)
  }

  return (
    <AdminProductsView
      products={products}
      currentPage={page}
      totalPages={Math.ceil(totalCount / limit)}
      vendors={vendors}
      stats={stats}
      filters={{ search: searchQuery, status: statusFilter, vendor: vendorFilter }}
    />
  )
}
