import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { CollectionData } from '@/components/Collection'

/**
 * Ported from `app/lib/supabase.server.ts`'s `supabasePublic` — a plain
 * anon-key client (no cookies, no user session) for public, RLS-protected
 * server-side reads (collections, latest products) that don't need auth
 * context. Different from `@/lib/supabase/server.ts`'s cookie-bound
 * `createServerClient`, which is for request-scoped authenticated reads.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYS

export const supabasePublic = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null

/**
 * Ported from app/lib/supabase.server.ts:126 (getCollectionById).
 */
export async function getCollectionById(collectionId: string): Promise<CollectionData | null> {
  if (!supabasePublic) return null

  try {
    let collection
    const { data: collectionBySlug } = await supabasePublic
      .from('collections')
      .select('*')
      .eq('slug', collectionId)
      .eq('is_active', true)
      .single()

    if (collectionBySlug) {
      collection = collectionBySlug
    } else {
      const { data: collectionById } = await supabasePublic
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .eq('is_active', true)
        .single()

      if (!collectionById) return null
      collection = collectionById
    }

    const { data: items } = await supabasePublic
      .from('collection_items')
      .select(`
        display_order,
        product:products (
          id,
          title,
          brand,
          price,
          currency,
          image_url_1,
          product_url
        )
      `)
      .eq('collection_id', collection.id)
      .order('display_order', { ascending: true })

    const products = (items || [])
      .filter((item) => item.product)
      .map((item) => item.product) as unknown as CollectionData['products']

    return {
      id: collection.id,
      title: collection.title,
      subtitle: collection.subtitle,
      slug: collection.slug,
      collectionUrl: collection.collection_url,
      image1: collection.image_1,
      image2: collection.image_2,
      image3: collection.image_3,
      image4: collection.image_4,
      products,
    }
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export interface LatestProduct {
  id: string
  title: string
  brand?: string
  category?: string
  price: number
  currency: string
  vintage_styles?: string
  imageUrl?: string
  vendorName: string
  productUrl?: string
  checkoutUrl?: string | null
  vendorId?: string
  tags?: string | null
}

/**
 * Ported from the inline `active_vendor_products` query in
 * app/routes/_index.tsx's loader (products.length >= 1 ? ... carousel).
 */
export async function getLatestProducts(limit = 12): Promise<LatestProduct[]> {
  if (!supabasePublic) return []

  try {
    const { data } = await supabasePublic
      .from('active_vendor_products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    return data.map((product) => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      currency: product.currency || 'EUR',
      vintage_styles: product.vintage_styles,
      imageUrl: product.image_url_1,
      vendorName: product.vendor_store_name || 'Unbekannter Händler',
      productUrl: product.product_url,
      checkoutUrl: product.checkout_url,
      vendorId: product.vendor_id,
      tags: product.tags,
    }))
  } catch (error) {
    console.error('Products loading error:', error)
    return []
  }
}

export type SupabaseSliderField = 'BRAND' | 'NEWEST' | 'CATEGORY' | 'VENDOR'

export interface SupabaseSliderProduct {
  id: string
  title: string
  brand?: string
  category?: string
  price: number
  currency: string
  condition?: string
  vintage_styles?: string
  image_url_1?: string
  vendor_store_name?: string
  vendor_id?: string
  product_url?: string
  checkout_url?: string | null
  tags?: string | null
  shipping_cost?: number | null
  free_shipping_threshold?: number | null
  delivery_time_min_days?: number | null
  delivery_time_max_days?: number | null
  tax_included?: boolean | null
  tax_rate?: number | null
}

/**
 * Algolia-free product fetch for ProductSliderBlock's "Supabase" data
 * source — same `active_vendor_products` view as `getLatestProducts`, with
 * an optional substring filter on brand/category/vendor name. `NEWEST`
 * applies no filter, just the existing created_at-desc ordering.
 */
export async function getSupabaseSliderProducts(
  field: SupabaseSliderField,
  query: string | null,
  limit = 12
): Promise<SupabaseSliderProduct[]> {
  if (!supabasePublic) return []

  try {
    let q = supabasePublic
      .from('active_vendor_products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (field === 'BRAND' && query) q = q.ilike('brand', `%${query}%`)
    else if (field === 'CATEGORY' && query) q = q.ilike('category', `%${query}%`)
    else if (field === 'VENDOR' && query) q = q.ilike('vendor_store_name', `%${query}%`)

    const { data } = await q
    return data ?? []
  } catch (error) {
    console.error('Supabase slider products error:', error)
    return []
  }
}

/**
 * Ported from the inline `platform_settings` query in
 * `_info.partner-werden.tsx`'s loader (vendor_starter_clicks).
 */
export async function getPlatformSetting(key: string): Promise<string | null> {
  if (!supabasePublic) return null

  try {
    const { data } = await supabasePublic
      .from('platform_settings')
      .select('value')
      .eq('key', key)
      .eq('is_public', false)
      .maybeSingle()

    return (data?.value as string) ?? null
  } catch (error) {
    console.error('Error fetching platform setting:', error)
    return null
  }
}
