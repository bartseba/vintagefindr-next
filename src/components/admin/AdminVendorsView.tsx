'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  MapPin,
  Calendar,
  Store,
  Globe,
  Package,
  LogOut,
  X,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { logoutAdmin } from '@/app/admin/dashboard/actions'
import { approveVendorWithEmail, rejectVendorApplication, resetVendorStatus } from '@/app/admin/vendors/actions'

export interface AdminVendorListItem {
  id: string
  firstName: string
  lastName: string
  email: string
  storeName: string
  storeWebsite: string | null
  storeLocation: string | null
  ecommercePlatform: string | null
  numberOfItems: number | null
  status: string
  createdAt: string
  updatedAt: string | null
  deleted: boolean
  deletedAt: string | null
  productCount: number
}

interface AdminVendorsViewProps {
  vendors: AdminVendorListItem[]
  currentPage: number
  totalPages: number
  stats: { total: number; pending: number; approved: number; rejected: number }
  filters: { search: string; status: string }
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatDateTime = (value: string) =>
  `${formatDate(value)} ${new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`

export function AdminVendorsView({ vendors, currentPage, totalPages, stats, filters }: AdminVendorsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedVendor, setSelectedVendor] = useState<AdminVendorListItem | null>(null)

  const buildUrl = (overrides: { search?: string; status?: string; page?: string }) => {
    const combined = { search: filters.search, status: filters.status, page: String(currentPage), ...overrides }
    const params = new URLSearchParams()
    if (combined.search) params.set('search', combined.search)
    if (combined.status && combined.status !== 'all') params.set('status', combined.status)
    if (combined.page && combined.page !== '1') params.set('page', combined.page)
    const qs = params.toString()
    return qs ? `/admin/vendors?${qs}` : '/admin/vendors'
  }

  const handleFilterChange = (key: 'status', value: string) => {
    router.push(buildUrl({ [key]: value === 'all' ? undefined : value, page: undefined }))
  }

  const handleVendorAction = (vendorId: string, action: 'approve' | 'reject' | 'reset') => {
    startTransition(async () => {
      let result
      if (action === 'approve') {
        result = await approveVendorWithEmail(vendorId)
      } else if (action === 'reject') {
        result = await rejectVendorApplication(vendorId)
      } else {
        result = await resetVendorStatus(vendorId)
      }

      if (result.success) {
        alert(result.message || 'Aktion erfolgreich durchgeführt')
        router.refresh()
      } else if (result.error) {
        alert('Fehler: ' + result.error)
      }
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getFilterButtonClass = (filter: string) => {
    const isActive = filters.status === filter || (filter === 'all' && !filters.status)
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
                <span>Vendor Management</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vendor Management</h1>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Ausstehend</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Genehmigt</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Abgelehnt</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <form method="get" action="/admin/vendors" className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  name="search"
                  placeholder="Suche nach Name, Store, E-Mail..."
                  className="pl-10"
                  defaultValue={filters.search}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange('status', 'all')}
                className={`${getFilterButtonClass('all')} border border-gray-200`}
              >
                Alle
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('status', 'pending')}
                className={`${getFilterButtonClass('pending')} border border-gray-200`}
              >
                Ausstehend
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('status', 'approved')}
                className={`${getFilterButtonClass('approved')} border border-gray-200`}
              >
                Genehmigt
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('status', 'rejected')}
                className={`${getFilterButtonClass('rejected')} border border-gray-200`}
              >
                Abgelehnt
              </button>
            </div>

            <Button type="submit" variant="outline">
              <Filter size={16} className="mr-2" />
              Suchen
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                      <span className="text-amber-700 font-medium text-lg">
                        {vendor.storeName.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vendor.storeName}
                        </h3>
                        {getStatusBadge(vendor.status)}
                        {vendor.deleted && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Gelöscht
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Inhaber:</span>
                            <span>{vendor.firstName} {vendor.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            <span>{vendor.email}</span>
                          </div>
                          {vendor.storeLocation && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span>{vendor.storeLocation}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          {vendor.storeWebsite && (
                            <div className="flex items-center gap-2">
                              <Globe size={14} />
                              <a
                                href={vendor.storeWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-600 hover:text-amber-700"
                              >
                                Website
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Package size={14} />
                            <span>{vendor.productCount} Produkte</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>Seit {formatDate(vendor.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {vendor.ecommercePlatform && (
                        <div className="mt-2 text-sm text-gray-500">
                          Platform: {vendor.ecommercePlatform}
                          {vendor.numberOfItems && ` • ~${vendor.numberOfItems} Artikel`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <Eye size={14} className="mr-1" />
                      Details
                    </Button>

                    {vendor.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'approve')}
                          disabled={isPending}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Genehmigen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'reject')}
                          disabled={isPending}
                        >
                          <XCircle size={14} className="mr-1" />
                          Ablehnen
                        </Button>
                      </>
                    )}

                    {vendor.status !== 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVendorAction(vendor.id, 'reset')}
                        disabled={isPending}
                      >
                        Status zurücksetzen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {vendors.length === 0 && (
              <div className="text-center py-16">
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Vendors gefunden
                </h3>
                <p className="text-gray-600">
                  {filters.search || filters.status !== 'all'
                    ? 'Keine Vendors entsprechen Ihren Suchkriterien.'
                    : 'Noch keine Vendor-Registrierungen vorhanden.'}
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

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                  <span className="text-amber-700 font-medium text-2xl">
                    {selectedVendor.storeName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedVendor.storeName}
                  </h3>
                  {getStatusBadge(selectedVendor.status)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Persönliche Informationen
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">
                      {selectedVendor.firstName} {selectedVendor.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">E-Mail:</span>
                    <a
                      href={`mailto:${selectedVendor.email}`}
                      className="font-medium text-amber-600 hover:text-amber-700"
                    >
                      {selectedVendor.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Store size={18} />
                  Shop Informationen
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedVendor.storeLocation && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Standort:</span>
                      <span className="font-medium text-gray-900">
                        {selectedVendor.storeLocation}
                      </span>
                    </div>
                  )}
                  {selectedVendor.storeWebsite && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Website:</span>
                      <a
                        href={selectedVendor.storeWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-amber-600 hover:text-amber-700"
                      >
                        {selectedVendor.storeWebsite}
                      </a>
                    </div>
                  )}
                  {selectedVendor.ecommercePlatform && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Plattform:</span>
                      <span className="font-medium text-gray-900">
                        {selectedVendor.ecommercePlatform}
                      </span>
                    </div>
                  )}
                  {selectedVendor.numberOfItems && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Artikel (geschätzt):</span>
                      <span className="font-medium text-gray-900">
                        ~{selectedVendor.numberOfItems}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hochgeladene Produkte:</span>
                    <span className="font-medium text-gray-900">
                      {selectedVendor.productCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Zeitstempel
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Registriert am:</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(selectedVendor.createdAt)} Uhr
                    </span>
                  </div>
                  {selectedVendor.updatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Zuletzt aktualisiert:</span>
                      <span className="font-medium text-gray-900">
                        {formatDateTime(selectedVendor.updatedAt)} Uhr
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {selectedVendor.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleVendorAction(selectedVendor.id, 'approve')
                        setSelectedVendor(null)
                      }}
                      disabled={isPending}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Genehmigen
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        handleVendorAction(selectedVendor.id, 'reject')
                        setSelectedVendor(null)
                      }}
                      disabled={isPending}
                    >
                      <XCircle size={16} className="mr-2" />
                      Ablehnen
                    </Button>
                  </>
                )}

                {selectedVendor.status !== 'pending' && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleVendorAction(selectedVendor.id, 'reset')
                      setSelectedVendor(null)
                    }}
                    disabled={isPending}
                  >
                    Status zurücksetzen
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setSelectedVendor(null)}
                >
                  Schließen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
