import type { Metadata } from 'next'
import { requireAuthUser } from '@/lib/auth/session'
import { FavoritesView, type FavoriteListItem } from '@/components/favorites/FavoritesView'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface FavoriteRow {
  id: string
  created_at: string
  products: {
    id: string
    vendor_id: string
    title: string
    brand: string | null
    price: number
    currency: string | null
    condition: string | null
    era: string | null
    category: string | null
    image_url_1: string | null
    product_url: string | null
    vendors?: { store_name: string | null; store_location: string | null } | null
  }
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}) {
  const { supabase, authUser } = await requireAuthUser('/favorites')
  const params = await searchParams

  const search = params.search || ''
  const category = params.category || ''
  const page = parseInt(params.page || '1')
  const limit = 24
  const offset = (page - 1) * limit

  let favorites: FavoriteListItem[] = []
  let totalCount = 0

  try {
    let favoritesQuery = supabase
      .from('user_favorites')
      .select(`
        *,
        products!inner(
          *,
          vendors!inner(
            store_name,
            store_location,
            status
          )
        )
      `)
      .eq('user_id', authUser.id)
      .eq('products.is_active', true)
      .eq('products.deleted', false)
      .eq('products.vendors.status', 'approved')

    if (search) {
      favoritesQuery = favoritesQuery.or(`title.ilike.%${search}%,brand.ilike.%${search}%`, { foreignTable: 'products' })
    }
    if (category) {
      favoritesQuery = favoritesQuery.eq('products.category', category)
    }

    const { data: favoritesData } = await favoritesQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (favoritesData && favoritesData.length > 0) {
      favorites = (favoritesData as unknown as FavoriteRow[]).map((fav) => ({
        id: fav.products.id,
        favoriteId: fav.id,
        title: fav.products.title,
        brand: fav.products.brand ?? undefined,
        price: fav.products.price,
        currency: fav.products.currency || 'EUR',
        condition: fav.products.condition ?? undefined,
        era: fav.products.era ?? undefined,
        imageUrl: fav.products.image_url_1 ?? undefined,
        vendorName: fav.products.vendors?.store_name || 'Unknown',
        productUrl: fav.products.product_url ?? undefined,
      }))
    }

    let countQuery = supabase
      .from('user_favorites')
      .select('products!inner(id, is_active, deleted, vendors!inner(status))', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('products.is_active', true)
      .eq('products.deleted', false)
      .eq('products.vendors.status', 'approved')

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,brand.ilike.%${search}%`, { foreignTable: 'products' })
    }
    if (category) {
      countQuery = countQuery.eq('products.category', category)
    }

    const { count } = await countQuery
    totalCount = count || 0
  } catch (error) {
    console.error('Favorites loader error:', error)
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <FavoritesView
      favorites={favorites}
      userId={authUser.id}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      search={search}
      category={category}
    />
  )
}
