import type { Metadata } from 'next'
import { requireAuthUser } from '@/lib/auth/session'
import { FollowingView, type FollowedVendorItem } from '@/components/following/FollowingView'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface FollowRow {
  id: string
  created_at: string
  vendors: {
    id: string
    store_name: string
    store_location: string | null
    store_website: string | null
  }
}

export default async function FollowingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { supabase, authUser } = await requireAuthUser('/following')
  const params = await searchParams

  const search = params.search || ''
  const page = parseInt(params.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  let followedVendors: FollowedVendorItem[] = []
  let totalCount = 0

  try {
    let countQuery = supabase
      .from('user_follows')
      .select('*, vendors!inner(status)', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('vendors.status', 'approved')

    let dataQuery = supabase
      .from('user_follows')
      .select(`
        *,
        vendors!inner(
          id,
          store_name,
          store_location,
          store_website,
          status
        )
      `)
      .eq('user_id', authUser.id)
      .eq('vendors.status', 'approved')

    if (search) {
      countQuery = countQuery.ilike('vendors.store_name', `%${search}%`)
      dataQuery = dataQuery.ilike('vendors.store_name', `%${search}%`)
    }

    const { count } = await countQuery
    totalCount = count || 0

    const { data: followsData } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (followsData) {
      const rows = followsData as unknown as FollowRow[]
      const vendorIds = rows.map((f) => f.vendors.id)
      const productCounts = new Map<string, number>()

      if (vendorIds.length > 0) {
        const { data: productData } = await supabase
          .from('products')
          .select('vendor_id')
          .in('vendor_id', vendorIds)
          .eq('is_active', true)

        if (productData) {
          productData.forEach((product) => {
            const count = productCounts.get(product.vendor_id) || 0
            productCounts.set(product.vendor_id, count + 1)
          })
        }
      }

      followedVendors = rows.map((follow) => ({
        followId: follow.id,
        vendorId: follow.vendors.id,
        storeName: follow.vendors.store_name,
        location: follow.vendors.store_location,
        website: follow.vendors.store_website,
        productCount: productCounts.get(follow.vendors.id) || 0,
        followedAt: follow.created_at,
      }))
    }
  } catch (error) {
    console.error('Following loader error:', error)
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <FollowingView
      followedVendors={followedVendors}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      search={search}
    />
  )
}
