import { requireVendorAuth } from '@/lib/auth/session'
import type { VendorPackageInfo } from '@/types/vendor-packages'
import type { VendorProductListItem } from '@/components/vendor/ProductGrid'
import { VendorProductsView } from '@/components/vendor/VendorProductsView'

interface RawProductRow {
  id: string
  title: string
  description: string | null
  brand: string | null
  condition: string | null
  category: string | null
  era: string | null
  price: number
  currency: string | null
  availability: string | null
  stock_qty: number | null
  is_active: boolean
  image_url_1: string | null
  product_url: string | null
  checkout_url: string | null
  tags: string | null
  external_product_id: string | null
  created_at: string
  updated_at: string
  brand_suggestion: { id: string; status: string; brand_name: string } | null
  category_suggestion: { id: string; status: string; category_name: string } | null
  size_suggestion: { id: string; status: string; size_value: string } | null
}

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; category?: string; page?: string }>
}) {
  const { supabase, vendor } = await requireVendorAuth()
  const params = await searchParams

  const searchQuery = params.search || ''
  const statusFilter = params.status || 'all'
  const categoryFilter = params.category || 'all'
  const page = parseInt(params.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const { data: packageInfoData } = await supabase
    .rpc('get_vendor_package_info', { p_vendor_id: vendor.id })
  const packageInfo = packageInfoData as VendorPackageInfo | null

  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id)
    .eq('deleted', false)

  if (searchQuery) {
    countQuery = countQuery.or(`title.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
  }
  if (categoryFilter !== 'all') {
    countQuery = countQuery.eq('category', categoryFilter)
  }
  if (statusFilter === 'published') {
    countQuery = countQuery.eq('is_active', true)
  } else if (statusFilter === 'draft') {
    countQuery = countQuery.eq('is_active', false)
  }

  const { count } = await countQuery
  const totalCount = count || 0

  let query = supabase
    .from('products')
    .select(`
      *,
      brand_suggestion:brand_suggestions!suggested_brand_id(id, status, brand_name),
      category_suggestion:category_suggestions!suggested_category_id(id, status, category_name),
      size_suggestion:size_suggestions!suggested_size_id(id, status, size_value)
    `)
    .eq('vendor_id', vendor.id)
    .eq('deleted', false)

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
  }
  if (categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter)
  }
  if (statusFilter === 'published') {
    query = query.eq('is_active', true)
  } else if (statusFilter === 'draft') {
    query = query.eq('is_active', false)
  }

  const { data: productsData } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  let products: VendorProductListItem[] = []
  let stats = { total: 0, published: 0, draft: 0, sold: 0 }

  if (productsData) {
    const rows = productsData as unknown as RawProductRow[]
    const productIds = rows.map((p) => p.id)
    const clickoutCounts = new Map<string, number>()

    if (productIds.length > 0) {
      const { data: clickoutData } = await supabase
        .from('product_clicks')
        .select('product_id')
        .in('product_id', productIds)

      if (clickoutData) {
        clickoutData.forEach((clickout) => {
          const count = clickoutCounts.get(clickout.product_id) || 0
          clickoutCounts.set(clickout.product_id, count + 1)
        })
      }
    }

    products = rows.map((product) => {
      const hasPendingSuggestions =
        product.brand_suggestion?.status === 'pending' ||
        product.category_suggestion?.status === 'pending' ||
        product.size_suggestion?.status === 'pending'

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        brand: product.brand,
        condition: product.condition,
        category: product.category,
        era: product.era,
        price: product.price,
        currency: product.currency || 'EUR',
        availability: product.availability,
        stockQty: product.stock_qty,
        status: product.is_active ? 'published' : 'draft',
        views: 0,
        clicks: clickoutCounts.get(product.id) || 0,
        imageUrl: product.image_url_1,
        productUrl: product.product_url,
        checkoutUrl: product.checkout_url,
        tags: product.tags,
        externalProductId: product.external_product_id,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        has_pending_suggestions: Boolean(hasPendingSuggestions),
        brand_suggestion: product.brand_suggestion,
        category_suggestion: product.category_suggestion,
        size_suggestion: product.size_suggestion,
      }
    })

    const { data: allProducts } = await supabase
      .from('products')
      .select('is_active, availability')
      .eq('vendor_id', vendor.id)
      .eq('deleted', false)

    if (allProducts) {
      stats = {
        total: allProducts.length,
        published: allProducts.filter((p) => p.is_active).length,
        draft: allProducts.filter((p) => !p.is_active).length,
        sold: allProducts.filter((p) => p.availability === 'out_of_stock').length,
      }
    }
  }

  return (
    <VendorProductsView
      products={products}
      totalCount={totalCount}
      currentPage={page}
      totalPages={Math.ceil(totalCount / limit)}
      limit={limit}
      stats={stats}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      categoryFilter={categoryFilter}
      packageInfo={packageInfo}
    />
  )
}
