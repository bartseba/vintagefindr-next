import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface FavoriteRow {
  id: string
  products: {
    id: string
    title: string
    brand: string | null
    price: number
    currency: string | null
    image_url_1: string | null
    product_url: string | null
    vendors?: { store_name: string | null } | null
  }
}

// TODO(sub-phase 2.x): port rate limiting (Remix's app/lib/rateLimit.server.ts
// + redis.server.ts) — skipped for now since this app isn't live yet.

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (!authUser || error) {
    return NextResponse.json({ favorites: [], user: null })
  }

  try {
    const { data: favoritesData } = await supabase
      .from('user_favorites')
      .select(`
        *,
        products!inner(
          *,
          vendors!inner(store_name, status)
        )
      `)
      .eq('user_id', authUser.id)
      .eq('products.is_active', true)
      .eq('products.deleted', false)
      .eq('products.vendors.status', 'approved')
      .order('created_at', { ascending: false })

    let favorites: ReturnType<typeof mapFavoriteRow>[] = []

    if (favoritesData && favoritesData.length > 0) {
      favorites = (favoritesData as unknown as FavoriteRow[]).map(mapFavoriteRow)
    }

    return NextResponse.json({ favorites, user: authUser })
  } catch (error) {
    console.error('Favorites API error:', error)
    return NextResponse.json({ favorites: [], user: authUser })
  }
}

function mapFavoriteRow(fav: FavoriteRow) {
  return {
    id: fav.products.id,
    favoriteId: fav.id,
    title: fav.products.title,
    brand: fav.products.brand,
    price: fav.products.price,
    currency: fav.products.currency || 'EUR',
    imageUrl: fav.products.image_url_1,
    vendorName: fav.products.vendors?.store_name || 'Unknown',
    productUrl: fav.products.product_url,
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  let actionData: { _action?: FormDataEntryValue | null; productId?: FormDataEntryValue | null }
  try {
    actionData = await request.json()
  } catch {
    const formData = await request.formData()
    actionData = {
      _action: formData.get('_action'),
      productId: formData.get('productId'),
    }
  }

  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (!authUser || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = actionData._action as string
  const productId = actionData.productId as string

  try {
    if (action === 'add') {
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('product_id', productId)
        .single()

      if (existing) {
        return NextResponse.json({ success: true, message: 'Already favorited' })
      }

      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: authUser.id,
          product_id: productId,
        })

      if (insertError) throw insertError

      const { data: product } = await supabase
        .from('products')
        .select(`
          *,
          vendors!inner(
            store_name,
            store_location,
            status
          )
        `)
        .eq('id', productId)
        .eq('vendors.status', 'approved')
        .single()

      const productData = product ? {
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        currency: product.currency || 'EUR',
        imageUrl: product.image_url_1,
        vendorName: product.vendors?.store_name || 'Unknown',
        productUrl: product.product_url,
      } : null

      return NextResponse.json({ success: true, message: 'Added to favorites', product: productData })

    } else if (action === 'remove') {
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', authUser.id)
        .eq('product_id', productId)

      if (deleteError) throw deleteError
      return NextResponse.json({ success: true, message: 'Removed from favorites' })

    } else if (action === 'toggle') {
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('product_id', productId)
        .single()

      if (existing) {
        const { error: deleteError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', authUser.id)
          .eq('product_id', productId)

        if (deleteError) throw deleteError
        return NextResponse.json({ success: true, action: 'removed', message: 'Removed from favorites' })
      } else {
        const { error: insertError } = await supabase
          .from('user_favorites')
          .insert({
            user_id: authUser.id,
            product_id: productId,
          })

        if (insertError) throw insertError

        const { data: product } = await supabase
          .from('products')
          .select(`
            *,
            vendors!inner(store_name)
          `)
          .eq('id', productId)
          .single()

        const productData = product ? {
          id: product.id,
          title: product.title,
          brand: product.brand,
          price: product.price,
          currency: product.currency || 'EUR',
          imageUrl: product.image_url_1,
          vendorName: product.vendors?.store_name || 'Unknown',
          productUrl: product.product_url,
        } : null

        return NextResponse.json({ success: true, action: 'added', message: 'Added to favorites', product: productData })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Favorites action error:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
