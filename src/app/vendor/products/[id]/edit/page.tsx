import { notFound } from 'next/navigation'
import { requireVendorAuth } from '@/lib/auth/session'
import { getAllNavigationSections, getAllSizes, getAllBrands } from '@/lib/directus'
import { VendorFooter } from '@/components/VendorFooter'
import { VendorProductEditForm, type EditableProduct } from '@/components/vendor/VendorProductEditForm'

export default async function VendorProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { supabase, vendor } = await requireVendorAuth()
  const { id: productId } = await params

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('vendor_id', vendor.id)
    .single()

  if (error || !product) {
    notFound()
  }

  const [navigationSections, sizes, brands] = await Promise.all([
    getAllNavigationSections(),
    getAllSizes(),
    getAllBrands(),
  ])

  return (
    <>
      <VendorProductEditForm
        product={product as EditableProduct}
        navigationSections={navigationSections}
        sizes={sizes}
        brands={brands}
      />
      <VendorFooter />
    </>
  )
}
