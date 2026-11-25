import { NextResponse } from 'next/server'
import { requireVendorAuth } from '@/lib/auth/session'
import { getShopifyAppConfigError, shopifyAppFetch } from '@/lib/shopifyApp'

// Asks the Shopify app whether the vendor's stored shop still exists and
// lets it clear the connection if the shop was deleted (Shopify does not
// reliably send app/uninstalled for deleted stores).
export async function POST() {
  const { vendor } = await requireVendorAuth()

  const configError = getShopifyAppConfigError()
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 })
  }

  try {
    const response = await shopifyAppFetch(`/api/verify/${vendor.id}`, { method: 'POST' })
    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('[shopify-verify] Request to Shopify app failed:', err)
    return NextResponse.json({ error: 'Verbindung zur Shopify-App fehlgeschlagen' }, { status: 502 })
  }
}
