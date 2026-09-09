import { NextResponse } from 'next/server'
import { requireVendorAuth } from '@/lib/auth/session'

export async function POST() {
  const { vendor } = await requireVendorAuth()

  const shopifyAppUrl = process.env.SHOPIFY_APP_URL
  if (!shopifyAppUrl) {
    return NextResponse.json({ error: 'SHOPIFY_APP_URL ist nicht konfiguriert' }, { status: 500 })
  }

  try {
    const response = await fetch(`${shopifyAppUrl}/api/resync/${vendor.id}`, { method: 'POST' })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Synchronisierung fehlgeschlagen' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[shopify-resync] Request to Shopify app failed:', err)
    return NextResponse.json({ error: 'Verbindung zur Shopify-App fehlgeschlagen' }, { status: 502 })
  }
}
