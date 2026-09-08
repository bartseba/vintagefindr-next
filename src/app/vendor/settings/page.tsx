import { requireVendorAuth } from '@/lib/auth/session'
import PageHeader from '@/components/PageHeader'
import { VendorFooter } from '@/components/VendorFooter'
import { VendorSettingsForm, type SettingsVendor } from '@/components/vendor/VendorSettingsForm'

export default async function VendorSettingsPage() {
  const { vendor } = await requireVendorAuth()

  const settingsVendor: SettingsVendor = {
    id: vendor.id,
    firstName: vendor.first_name,
    lastName: vendor.last_name,
    email: vendor.email,
    storeName: vendor.store_name,
    storeWebsite: vendor.store_website,
    storeLocation: vendor.store_location,
    ecommercePlatform: vendor.ecommerce_platform,
    inventorySystem: vendor.inventory_system,
    numberOfItems: vendor.number_of_items,
    status: vendor.status,
    createdAt: vendor.created_at,
    monthlyClickGoal: vendor.monthly_click_goal || 2000,
    ctrGoal: vendor.ctr_goal || 5.0,
    avatarUrl: vendor.avatar_url,
    isActive: vendor.is_active,
    pausedAt: vendor.paused_at,
    shopifyDomain: vendor.shopify_domain,
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageHeader backLink="/vendor/dashboard" />
      <VendorSettingsForm vendor={settingsVendor} />
      <VendorFooter />
    </div>
  )
}
