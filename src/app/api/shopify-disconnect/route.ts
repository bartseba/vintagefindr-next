import { NextResponse } from 'next/server'
import { requireVendorAuth } from '@/lib/auth/session'
import { getShopifyAppConfigError, shopifyAppFetch } from '@/lib/shopifyApp'

export async function POST() {
  const { vendor } = await requireVendorAuth()

  const configError = getShopifyAppConfigError()
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 })
  }

  try {
    const response = await shopifyAppFetch(`/api/disconnect/${vendor.id}`, { method: 'POST' })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Trennen der Verbindung fehlgeschlagen' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[shopify-disconnect] Request to Shopify app failed:', err)
    return NextResponse.json({ error: 'Verbindung zur Shopify-App fehlgeschlagen' }, { status: 502 })
  }
}
