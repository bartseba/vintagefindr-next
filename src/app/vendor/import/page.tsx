import { requireVendorAuth } from '@/lib/auth/session'
import PageHeader from '@/components/PageHeader'
import { VendorFooter } from '@/components/VendorFooter'
import { VendorImportForm } from '@/components/vendor/VendorImportForm'
import type { ImportHistoryItem } from '@/components/vendor/ImportHistory'

export default async function VendorImportPage() {
  const { supabase, vendor } = await requireVendorAuth()

  const { data: recentProducts } = await supabase
    .from('products')
    .select('created_at, title')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const importHistory: ImportHistoryItem[] = (recentProducts || []).map((product, index) => ({
    id: `recent-${index}`,
    filename: `${product.title.substring(0, 20)}...`,
    date: new Date(product.created_at).toLocaleDateString('de-DE'),
    rows: 1,
    successful: 1,
    errors: 0,
    status: 'completed',
  }))

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageHeader backLink="/vendor/dashboard" />
      <VendorImportForm importHistory={importHistory} shopifyDomain={vendor.shopify_domain} />
      <VendorFooter />
    </div>
  )
}
