import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Heart,
  Users,
  Package,
  TrendingUp,
  Settings,
  Store,
  MousePointerClick,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ProductCard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FavoritesStoreSync } from '@/components/FavoritesStoreSync'
import { requireAuthUser } from '@/lib/auth/session'
import { browse } from '@/constant/routes'
import type { FavoriteProduct } from '@/hooks/useFavoritesQuery'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface DashboardFavorite extends FavoriteProduct {
  condition?: string
  era?: string
}

interface FollowedVendor {
  id: string
  storeName: string
  location: string | null
  website: string | null
  followedAt: string
}

interface Activity {
  id: string
  message: string
  timestamp: string
}

export default async function DashboardPage() {
  const { supabase, authUser } = await requireAuthUser('/dashboard')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const user = userData || {
    id: authUser.id,
    email: authUser.email,
    first_name: '',
    last_name: '',
    username: null,
    avatar_url: null,
    bio: null,
    location: null,
    website: null,
  }

  let favorites: DashboardFavorite[] = []
  let followedVendors: FollowedVendor[] = []
  let recentActivity: Activity[] = []
  let stats = { favoriteCount: 0, followingCount: 0, viewedProducts: 0 }

  try {
    const { data: favoritesData } = await supabase
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
      .order('created_at', { ascending: false })
      .limit(6)

    if (favoritesData && favoritesData.length > 0) {
      favorites = favoritesData.map((fav) => ({
        id: fav.products.id,
        title: fav.products.title,
        brand: fav.products.brand,
        price: fav.products.price,
        currency: fav.products.currency || 'EUR',
        condition: fav.products.condition,
        era: fav.products.era,
        imageUrl: fav.products.image_url_1,
        vendorName: fav.products.vendors?.store_name || 'Unknown',
        productUrl: fav.products.product_url,
      }))
    }

    const { data: followsData } = await supabase
      .from('user_follows')
      .select(`
        *,
        vendors!inner(
          id,
          store_name,
          store_location,
          store_website
        )
      `)
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (followsData) {
      followedVendors = followsData.map((follow) => ({
        id: follow.vendors.id,
        storeName: follow.vendors.store_name,
        location: follow.vendors.store_location,
        website: follow.vendors.store_website,
        followedAt: follow.created_at,
      }))
    }

    const { count: favoriteCount } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)

    const { count: followingCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)

    stats = {
      favoriteCount: favoriteCount || 0,
      followingCount: followingCount || 0,
      viewedProducts: (favoriteCount || 0) + (followingCount || 0),
    }

    // Mock recent activity — matches the Remix original, which hardcoded this too (no real activity feed exists yet)
    recentActivity = [
      { id: '1', message: 'Produkt zu Favoriten hinzugefügt', timestamp: new Date().toISOString() },
      { id: '2', message: 'Vintage Store München gefolgt', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ]
  } catch (error) {
    console.error('Dashboard loader error:', error)
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader user={user} />
      <FavoritesStoreSync favorites={favorites} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen zurück{user?.first_name ? `, ${user.first_name}` : ''}!
          </h1>
          <p className="text-gray-600">
            Entdecken Sie neue Vintage-Schätze und verwalten Sie Ihre Favoriten
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.favoriteCount}</p>
                <p className="text-sm text-gray-600">Favoriten</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-600">Gefolgte Shops</p>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Coming Soon</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.viewedProducts}</p>
                <p className="text-sm text-gray-600">Interaktionen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Favorite Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Meine Favoriten</h2>
                <Link
                  href="/favorites"
                  className="text-vintage-primary hover:via-vintage-secondary text-sm font-medium"
                >
                  Alle anzeigen
                </Link>
              </div>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      brand={product.brand}
                      price={product.price}
                      currency={product.currency}
                      condition={product.condition}
                      era={product.era}
                      imageUrl={product.imageUrl}
                      vendorName={product.vendorName}
                      productUrl={product.productUrl}
                      userId={user?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">Noch keine Favoriten</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Entdecken Sie Produkte und fügen Sie sie zu Ihren Favoriten hinzu
                  </p>
                  <Link href={browse}>
                    <Button size="sm">
                      <Package size={14} className="mr-2" />
                      Produkte entdecken
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Followed Vendors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative opacity-60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">Gefolgte Shops</h2>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Coming Soon</span>
                </div>
              </div>

              {followedVendors.length > 0 ? (
                <div className="space-y-4">
                  {followedVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                          <span className="text-amber-700 font-medium text-lg">
                            {vendor.storeName.charAt(0)}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-900">
                            {vendor.storeName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vendor.location || 'Standort unbekannt'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Gefolgt seit {new Date(vendor.followedAt).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:text-amber-700"
                          >
                            <Button variant="outline" size="sm">
                              <Store size={14} className="mr-1" />
                              Shop
                            </Button>
                          </a>
                        )}
                        <Button variant="outline" size="sm">
                          Entfolgen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">Diese Funktion kommt bald</p>
                  <p className="text-gray-400 text-sm">
                    Bald können Sie Ihren Lieblings-Vintage-Shops folgen
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schnellzugriff</h3>

              <div className="space-y-3">
                <Link href={browse} className="block">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Package className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Produkte entdecken</span>
                  </div>
                </Link>

                <Link href="/favorites" className="block">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Meine Favoriten</span>
                  </div>
                </Link>

                <div className="relative opacity-60">
                  <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Gefolgte Shops</span>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Bald</span>
                  </div>
                </div>

                <Link href="/profile" className="block">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Profil bearbeiten</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Letzte Aktivitäten</h3>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium text-sm">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <div className="text-center py-4">
                    <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Noch keine Aktivitäten</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
