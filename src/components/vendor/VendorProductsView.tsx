'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { VendorFooter } from '@/components/VendorFooter'
import { ProductFilterBar } from '@/components/vendor/ProductFilterBar'
import { ProductGrid, type VendorProductListItem } from '@/components/vendor/ProductGrid'
import { ProductBulkActions } from '@/components/vendor/ProductBulkActions'
import { ProductPagination } from '@/components/vendor/ProductPagination'
import type { VendorPackageInfo } from '@/types/vendor-packages'
import { updateProductStatus, deleteProduct, bulkDeleteProducts } from '@/app/vendor/products/actions'

interface VendorProductsViewProps {
  products: VendorProductListItem[]
  totalCount: number
  currentPage: number
  totalPages: number
  limit: number
  stats: { total: number; published: number; draft: number; sold: number }
  searchQuery: string
  statusFilter: string
  categoryFilter: string
  packageInfo: VendorPackageInfo | null
}

export function VendorProductsView({
  products,
  totalCount,
  currentPage,
  totalPages,
  limit,
  stats,
  searchQuery,
  statusFilter,
  categoryFilter,
  packageInfo,
}: VendorProductsViewProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const selectAll = selectedProducts.length === products.length && products.length > 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const buildUrl = (overrides: { search?: string; status?: string; category?: string; page?: string }) => {
    const combined = {
      search: searchQuery,
      status: statusFilter,
      category: categoryFilter,
      page: String(currentPage),
      ...overrides,
    }
    const params = new URLSearchParams()
    if (combined.search) params.set('search', combined.search)
    if (combined.status && combined.status !== 'all') params.set('status', combined.status)
    if (combined.category && combined.category !== 'all') params.set('category', combined.category)
    if (combined.page && combined.page !== '1') params.set('page', combined.page)
    const qs = params.toString()
    return qs ? `/vendor/products?${qs}` : '/vendor/products'
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildUrl({ search: localSearchQuery.trim() || undefined }))
  }

  const handleFilterChange = (key: string, filter: string) => {
    router.push(buildUrl({ [key]: filter === 'all' ? undefined : filter, page: undefined }))
  }

  const clearFilters = () => {
    setLocalSearchQuery('')
    router.push('/vendor/products')
  }

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page === 1 ? undefined : String(page) }))
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p.id))
    }
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleProductAction = (productId: string, action: string, confirmAction: boolean) => {
    if (action === 'delete' && confirmAction) {
      if (!confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        return
      }
    }

    setOpenDropdown(null)
    startTransition(async () => {
      if (action === 'delete') {
        await deleteProduct(productId)
      } else if (action === 'activate' || action === 'deactivate') {
        await updateProductStatus(productId, action)
      }
      router.refresh()
    })
  }

  const handleBulkDelete = (productIds: string[]) => {
    startTransition(async () => {
      await bulkDeleteProducts(productIds)
      router.refresh()
    })
  }

  const filteredStats = {
    total: products.length,
    published: products.filter((p) => p.status === 'published').length,
    draft: products.filter((p) => p.status === 'draft').length,
    sold: products.filter((p) => p.status === 'sold').length,
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="bg-white shadow-md border-b-[#EAEAEA] border-b-1 border-solid py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/vendor/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                  <span>Zurück</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Logo />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!packageInfo?.has_active_package && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-red-900">
                    Achtung: Ihre Produkte sind nicht öffentlich sichtbar
                  </h3>
                  <p className="mt-2 text-sm text-red-800 font-semibold">
                    Sie haben derzeit kein aktives Klickpaket. Ihre Produkte werden NICHT in den Suchergebnissen angezeigt.
                  </p>
                  <p className="mt-2 text-sm text-red-700">
                    Buchen Sie jetzt ein Paket, um Ihre Produkte wieder sichtbar zu machen.
                  </p>
                  <div className="mt-4">
                    <Link href="/vendor/pricetable">
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Jetzt Paket buchen
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Meine Produkte</h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>
                  {totalCount} Produkte • {filteredStats.published} veröffentlicht
                  {(searchQuery || statusFilter !== 'all') && (
                    <span className="ml-2 text-amber-600">
                      (gefiltert von {stats.total} gesamt)
                    </span>
                  )}
                </span>
                {totalCount > limit && (
                  <span>
                    Seite {currentPage} von {totalPages}
                  </span>
                )}
              </div>
            </div>
            <Link className="bg-vintage-primary text-white flex p-3 rounded-md items-center" href="/vendor/products/new">
              <Plus size={16} className="mr-2" />
              Produkt hinzufügen
            </Link>
          </div>

          <ProductFilterBar
            localSearchQuery={localSearchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            searchQuery={searchQuery}
          />

          <ProductGrid
            products={products}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            openDropdown={openDropdown}
            onDropdownToggle={setOpenDropdown}
            onProductAction={handleProductAction}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onClearFilters={clearFilters}
          />

          {totalCount > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <ProductBulkActions
                products={products}
                selectedProducts={selectedProducts}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onProductAction={handleProductAction}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedProducts([])}
              />

              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                limit={limit}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
      <VendorFooter />
    </>
  )
}
