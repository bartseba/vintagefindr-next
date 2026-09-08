import Link from 'next/link'
import {
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
  Package,
  Power,
  PowerOff,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface VendorProductListItem {
  id: string
  title: string
  description: string | null
  brand: string | null
  condition: string | null
  category: string | null
  era: string | null
  price: number
  currency: string
  availability: string | null
  stockQty: number | null
  status: 'published' | 'draft' | 'sold'
  views: number
  clicks: number
  imageUrl: string | null
  productUrl: string | null
  checkoutUrl: string | null
  tags: string | null
  externalProductId: string | null
  createdAt: string
  updatedAt: string
  has_pending_suggestions: boolean
  brand_suggestion: { id: string; status: string; brand_name: string } | null
  category_suggestion: { id: string; status: string; category_name: string } | null
  size_suggestion: { id: string; status: string; size_value: string } | null
}

interface ProductGridProps {
  products: VendorProductListItem[]
  selectedProducts: string[]
  onProductSelect: (productId: string) => void
  openDropdown: string | null
  onDropdownToggle: (productId: string | null) => void
  onProductAction: (productId: string, action: string, confirmAction: boolean) => void
  searchQuery: string
  statusFilter: string
  onClearFilters: () => void
}

export function ProductGrid({
  products,
  selectedProducts,
  onProductSelect,
  openDropdown,
  onDropdownToggle,
  onProductAction,
  searchQuery,
  statusFilter,
  onClearFilters,
}: ProductGridProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
    }

    const labels = {
      published: 'Veröffentlicht',
      draft: 'Entwurf',
      sold: 'Ausverkauft',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          {searchQuery || statusFilter !== 'all' ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Produkte gefunden
              </h3>
              <p className="text-gray-600 mb-6">
                Keine Produkte entsprechen Ihren Suchkriterien.
              </p>
              <Button onClick={onClearFilters} variant="outline">
                Filter zurücksetzen
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine Produkte
              </h3>
              <p className="text-gray-600 mb-6">
                Fügen Sie Ihr erstes Produkt hinzu, um loszulegen.
              </p>
              <Link href="/vendor/products/new">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Erstes Produkt hinzufügen
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="divide-y divide-gray-100">
        {products.map((product) => (
          <div key={product.id} className="px-4 grid grid-cols-[15px_auto] hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.id)}
              onChange={() => onProductSelect(product.id)}
              className="rounded border-gray-300"
            />
            <Link href={`/vendor/products/${product.id}/edit`} className="p-6 gap-6 flex items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches AvatarUpload's existing plain-<img> approach
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

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 truncate">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Kategorie: {product.category || 'Keine Kategorie'}</span>
                      <span>Marke: {product.brand && product.brand}</span>
                      <span>Preis: {product.currency === 'EUR' ? '€' : product.currency}{product.price}</span>
                    </div>
                    {product.has_pending_suggestions && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Wartet auf Freigabe:
                        {product.brand_suggestion?.status === 'pending' && <span className="ml-1">Marke</span>}
                        {product.category_suggestion?.status === 'pending' && <span className="ml-1">Kategorie</span>}
                        {product.size_suggestion?.status === 'pending' && <span className="ml-1">Größe</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(product.status)}
                    <div className="flex items-center gap-2">
                      <Link href={`/vendor/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Bearbeiten
                        </Button>
                      </Link>

                      <div className="relative dropdown-container">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            onDropdownToggle(openDropdown === product.id ? null : product.id)
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </Button>

                        {openDropdown === product.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            {product.status === 'published' ? (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  onProductAction(product.id, 'deactivate', true)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <PowerOff size={14} />
                                Deaktivieren
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  onProductAction(product.id, 'activate', true)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Power size={14} />
                                Aktivieren
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                onProductAction(product.id, 'delete', true)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Löschen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{product.clicks} Klicks</span>
                  </div>
                  {product.availability === 'out_of_stock' && (
                    <>
                      <span>•</span>
                      <span className="text-red-600">Ausverkauft</span>
                    </>
                  )}
                  {product.stockQty && (
                    <>
                      <span>•</span>
                      <span>{product.stockQty} auf Lager</span>
                    </>
                  )}
                  {product.tags && product.tags.includes('has-errors') && (
                    <>
                      <span>•</span>
                      <span className="text-red-600 font-medium">Benötigt Überarbeitung</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
