import { notFound } from 'next/navigation'
import { requireAdminAuth } from '@/lib/auth/session'
import { getAllNavigationSections, getAllBrands } from '@/lib/directus'
import { AdminProductEditForm, type AdminEditProduct } from '@/components/admin/AdminProductEditForm'

interface RawProduct {
  id: string
  title: string
  brand: string | null
  category: string | null
  description: string | null
  price: number
  currency: string | null
  condition: string | null
  availability: string | null
  tags: string | null
  vintage_styles: string | null
  image_url_1: string | null
  image_url_2: string | null
  image_url_3: string | null
  product_url: string | null
  checkout_url: string | null
  is_active: boolean
  external_product_id: string
  external_variant_id: string | null
  vendor_id: string
  created_at: string
  updated_at: string
  vendors: { store_name: string } | null
}

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { supabase } = await requireAdminAuth()
  const { id: productId } = await params

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      vendors!inner(store_name)
    `)
    .eq('id', productId)
    .single()

  if (!product) {
    notFound()
  }

  const raw = product as RawProduct

  const { count: clicksCount } = await supabase
    .from('clickouts')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  const productData: AdminEditProduct = {
    id: raw.id,
    title: raw.title,
    brand: raw.brand,
    category: raw.category,
    description: raw.description,
    price: raw.price,
    currency: raw.currency || 'EUR',
    condition: raw.condition,
    availability: raw.availability || 'in stock',
    tags: raw.tags,
    vintageStyles: raw.vintage_styles,
    imageUrl1: raw.image_url_1,
    imageUrl2: raw.image_url_2,
    imageUrl3: raw.image_url_3,
    productUrl: raw.product_url,
    checkoutUrl: raw.checkout_url,
    isActive: raw.is_active,
    externalProductId: raw.external_product_id,
    externalVariantId: raw.external_variant_id,
    vendorId: raw.vendor_id,
    vendorName: raw.vendors?.store_name || 'Unknown',
    clicks: clicksCount || 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }

  const [navigationSections, brands] = await Promise.all([
    getAllNavigationSections(),
    getAllBrands(),
  ])

  return (
    <AdminProductEditForm product={productData} navigationSections={navigationSections} brands={brands} />
  )
}
