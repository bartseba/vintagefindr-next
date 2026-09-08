import { NextResponse, type NextRequest } from 'next/server'
import { requireVendorAuth } from '@/lib/auth/session'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(request, RATE_LIMITS.standard, 'suggestions')
  if (rateLimitResponse) return rateLimitResponse

  const { supabase, vendor } = await requireVendorAuth()

  const { type, value } = await request.json()

  if (!type || !value) {
    return NextResponse.json({ error: 'Missing type or value' }, { status: 400 })
  }

  if (!['brand', 'category', 'size'].includes(type)) {
    return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 })
  }

  try {
    const tableName = `${type}_suggestions`
    const columnName = type === 'brand' ? 'brand_name' : type === 'category' ? 'category_name' : 'size_value'

    const { data: existing } = await supabase
      .from(tableName)
      .select('id, status')
      .eq('vendor_id', vendor.id)
      .eq(columnName, value)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        suggestionId: existing.id,
        status: existing.status,
        message: `This ${type} suggestion already exists with status: ${existing.status}`,
      })
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert({
        vendor_id: vendor.id,
        [columnName]: value,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, suggestionId: data.id, status: 'pending' })
  } catch (error) {
    console.error('Suggestion creation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
