import { requireVendorAuth } from '@/lib/auth/session'
import { getAllNavigationItems, getAllSizes, getAllBrands } from '@/lib/directus'
import PageHeader from '@/components/PageHeader'
import { VendorFooter } from '@/components/VendorFooter'
import { VendorProductNewForm } from '@/components/vendor/VendorProductNewForm'

export default async function VendorProductNewPage() {
  await requireVendorAuth()

  const [navigationItems, sizes, brands] = await Promise.all([
    getAllNavigationItems(),
    getAllSizes(),
    getAllBrands(),
  ])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageHeader backLink="/vendor/dashboard" />
      <VendorProductNewForm navigationItems={navigationItems} sizes={sizes} brands={brands} />
      <VendorFooter />
    </div>
  )
}
