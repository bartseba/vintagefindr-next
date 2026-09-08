'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  Filter,
  Edit,
  Power,
  PowerOff,
  Trash2,
  Package,
  TrendingUp,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { logoutAdmin } from '@/app/admin/dashboard/actions'
import { activateAdminProduct, deactivateAdminProduct, deleteAdminProduct } from '@/app/admin/products/actions'

export interface AdminProductListItem {
  id: string
  title: string
  brand: string | null
  category: string | null
  price: number
  currency: string
  condition: string | null
  isActive: boolean
  imageUrl: string | null
  vendorName: string
  vendorId: string
  clicks: number
  createdAt: string
  updatedAt: string
}

interface AdminProductsViewProps {
  products: AdminProductListItem[]
  currentPage: number
  totalPages: number
  vendors: Array<{ id: string; store_name: string }>
  stats: { total: number; active: number; inactive: number; flagged: number }
  filters: { search: string; status: string; vendor: string }
}

const formatDateTime = (value: string) =>
  `${new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`

export function AdminProductsView({ products, currentPage, totalPages, vendors, stats, filters }: AdminProductsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const buildUrl = (overrides: { search?: string; status?: string; vendor?: string; page?: string }) => {
    const combined = { search: filters.search, status: filters.status, vendor: filters.vendor, page: String(currentPage), ...overrides }
    const params = new URLSearchParams()
    if (combined.search) params.set('search', combined.search)
    if (combined.status && combined.status !== 'all') params.set('status', combined.status)
    if (combined.vendor && combined.vendor !== 'all') params.set('vendor', combined.vendor)
    if (combined.page && combined.page !== '1') params.set('page', combined.page)
    const qs = params.toString()
    return qs ? `/admin/products?${qs}` : '/admin/products'
  }

  const handleFilterChange = (key: 'status' | 'vendor', value: string) => {
    router.push(buildUrl({ [key]: value === 'all' ? undefined : value, page: undefined }))
  }

  const handleProductAction = (productId: string, action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete' && !confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      return
    }

    startTransition(async () => {
      if (action === 'activate') {
        await activateAdminProduct(productId)
      } else if (action === 'deactivate') {
        await deactivateAdminProduct(productId)
      } else {
        await deleteAdminProduct(productId)
      }
      router.refresh()
    })
  }

  const getStatusBadge = (isActive: boolean) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? 'Aktiv' : 'Inaktiv'}
    </span>
  )

  const getFilterButtonClass = (filter: string, type: 'status') => {
    const isActive = filters[type] === filter || (filter === 'all' && !filters[type])
    return `px-3 py-1 text-sm rounded transition-colors ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>Product Management</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <form action={logoutAdmin}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut size={16} className="mr-2" />
                  Abmelden
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Management</h1>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Aktiv</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <div className="text-sm text-gray-600">Inaktiv</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
              <div className="text-sm text-gray-600">Gemeldet</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <form method="get" action="/admin/products" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    name="search"
                    placeholder="Suche nach Titel, Marke, Kategorie..."
                    className="pl-10"
                    defaultValue={filters.search}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  name="vendor"
                  value={filters.vendor}
                  onChange={(e) => handleFilterChange('vendor', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="all">Alle Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.store_name}
                    </option>
                  ))}
                </select>

                <Button type="submit" variant="outline">
                  <Filter size={16} className="mr-2" />
                  Suchen
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange('status', 'all')}
                className={`${getFilterButtonClass('all', 'status')} border border-gray-200`}
              >
                Alle
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('status', 'active')}
                className={`${getFilterButtonClass('active', 'status')} border border-gray-200`}
              >
                Aktiv
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('status', 'inactive')}
                className={`${getFilterButtonClass('inactive', 'status')} border border-gray-200`}
              >
                Inaktiv
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div key={product.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches ProductGrid's existing plain-<img> approach
                        <img
                          src={`${product.imageUrl}?class=thumbnail`}
                          alt={product.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 font-medium text-lg">
                          {product.title.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.title}
                        </h3>
                        {getStatusBadge(product.isActive)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div>
                            <span className="font-medium">Vendor:</span> {product.vendorName}
                          </div>
                          <div>
                            <span className="font-medium">Preis:</span> {product.currency === 'EUR' ? '€' : product.currency}{product.price} inkl. MwSt.
                          </div>
                          {product.brand && (
                            <div>
                              <span className="font-medium">Marke:</span> {product.brand}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          {product.category && (
                            <div>
                              <span className="font-medium">Kategorie:</span> {product.category}
                            </div>
                          )}
                          {product.condition && (
                            <div>
                              <span className="font-medium">Zustand:</span> {product.condition}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <TrendingUp size={14} />
                            <span>{product.clicks} Klicks</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Erstellt: {formatDateTime(product.createdAt)}
                        {product.updatedAt !== product.createdAt && (
                          <span> • Aktualisiert: {formatDateTime(product.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit size={14} className="mr-1" />
                        Bearbeiten
                      </Button>
                    </Link>

                    {product.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProductAction(product.id, 'deactivate')}
                        disabled={isPending}
                      >
                        <PowerOff size={14} className="mr-1" />
                        Deaktivieren
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleProductAction(product.id, 'activate')}
                        disabled={isPending}
                      >
                        <Power size={14} className="mr-1" />
                        Aktivieren
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProductAction(product.id, 'delete')}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Löschen
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Produkte gefunden
                </h3>
                <p className="text-gray-600">
                  {filters.search || filters.status !== 'all' || filters.vendor !== 'all'
                    ? 'Keine Produkte entsprechen Ihren Suchkriterien.'
                    : 'Noch keine Produkte vorhanden.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Link href={buildUrl({ page: String(Math.max(1, currentPage - 1)) })}>
              <Button type="button" variant="outline" size="sm" disabled={currentPage === 1}>
                ‹
              </Button>
            </Link>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
              return (
                <Link key={pageNum} href={buildUrl({ page: String(pageNum) })}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={pageNum === currentPage ? 'bg-gray-900 text-white' : ''}
                  >
                    {pageNum}
                  </Button>
                </Link>
              )
            })}

            <Link href={buildUrl({ page: String(Math.min(totalPages, currentPage + 1)) })}>
              <Button type="button" variant="outline" size="sm" disabled={currentPage === totalPages}>
                ›
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
