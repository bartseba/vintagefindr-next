import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const { supabase } = await requireAdminAuth()

  const query = request.nextUrl.searchParams.get('q') || ''

  try {
    let productsQuery = supabase
      .from('products')
      .select('id, title, brand, price, currency, image_url_1')
      .order('created_at', { ascending: false })
      .limit(20)

    if (query) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query)

      if (isUUID) {
        productsQuery = productsQuery.eq('id', query)
      } else {
        productsQuery = productsQuery.or(`title.ilike.%${query}%,brand.ilike.%${query}%`)
      }
    }

    const { data: products, error } = await productsQuery

    if (error) {
      console.error('Product search error:', error)
      return NextResponse.json({ products: [], error: error.message })
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Product search exception:', error)
    return NextResponse.json({ products: [], error: 'Search failed' })
  }
}
