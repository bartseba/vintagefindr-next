import { requireAdminAuth } from '@/lib/auth/session'
import { AdminVendorsView, type AdminVendorListItem } from '@/components/admin/AdminVendorsView'

interface VendorRow {
  id: string
  first_name: string
  last_name: string
  email: string
  store_name: string
  store_website: string | null
  store_location: string | null
  ecommerce_platform: string | null
  number_of_items: number | null
  status: string
  created_at: string
  updated_at: string | null
  deleted: boolean | null
  deleted_at: string | null
}

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}) {
  const { supabase } = await requireAdminAuth()
  const params = await searchParams

  const searchQuery = params.search || ''
  const statusFilter = params.status || 'all'
  const page = parseInt(params.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let vendors: AdminVendorListItem[] = []
  let totalCount = 0
  let stats = { total: 0, pending: 0, approved: 0, rejected: 0 }

  try {
    let countQuery = supabase.from('vendors').select('*', { count: 'exact', head: true })
    let dataQuery = supabase.from('vendors').select('*')

    if (searchQuery) {
      const orFilter = `store_name.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
      countQuery = countQuery.or(orFilter)
      dataQuery = dataQuery.or(orFilter)
    }

    if (statusFilter !== 'all') {
      countQuery = countQuery.eq('status', statusFilter)
      dataQuery = dataQuery.eq('status', statusFilter)
    }

    const { count } = await countQuery
    totalCount = count || 0

    const { data: vendorsData } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (vendorsData) {
      const rows = vendorsData as VendorRow[]
      const vendorIds = rows.map((v) => v.id)
      const productCounts = new Map<string, number>()

      if (vendorIds.length > 0) {
        const { data: productData } = await supabase
          .from('products')
          .select('vendor_id')
          .in('vendor_id', vendorIds)

        if (productData) {
          productData.forEach((product: { vendor_id: string }) => {
            const count = productCounts.get(product.vendor_id) || 0
            productCounts.set(product.vendor_id, count + 1)
          })
        }
      }

      vendors = rows.map((vendor) => ({
        id: vendor.id,
        firstName: vendor.first_name,
        lastName: vendor.last_name,
        email: vendor.email,
        storeName: vendor.store_name,
        storeWebsite: vendor.store_website,
        storeLocation: vendor.store_location,
        ecommercePlatform: vendor.ecommerce_platform,
        numberOfItems: vendor.number_of_items,
        status: vendor.status,
        createdAt: vendor.created_at,
        updatedAt: vendor.updated_at,
        deleted: vendor.deleted || false,
        deletedAt: vendor.deleted_at,
        productCount: productCounts.get(vendor.id) || 0,
      }))
    }

    const { data: allVendors } = await supabase.from('vendors').select('status')

    if (allVendors) {
      stats = {
        total: allVendors.length,
        pending: allVendors.filter((v: { status: string }) => v.status === 'pending').length,
        approved: allVendors.filter((v: { status: string }) => v.status === 'approved').length,
        rejected: allVendors.filter((v: { status: string }) => v.status === 'rejected').length,
      }
    }
  } catch (error) {
    console.error('Admin vendors error:', error)
  }

  return (
    <AdminVendorsView
      vendors={vendors}
      currentPage={page}
      totalPages={Math.ceil(totalCount / limit)}
      stats={stats}
      filters={{ search: searchQuery, status: statusFilter }}
    />
  )
}
