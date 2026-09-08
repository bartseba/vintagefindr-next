'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Users, MapPin, Globe, Package, UserMinus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { browse } from '@/constant/routes'
import { unfollowVendor } from '@/app/(info)/following/actions'

export interface FollowedVendorItem {
  followId: string
  vendorId: string
  storeName: string
  location: string | null
  website: string | null
  productCount: number
  followedAt: string
}

interface FollowingViewProps {
  followedVendors: FollowedVendorItem[]
  totalCount: number
  currentPage: number
  totalPages: number
  search: string
}

export function FollowingView({ followedVendors, totalCount, currentPage, totalPages, search }: FollowingViewProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const handleUnfollow = (followId: string) => {
    if (!confirm('Möchten Sie diesem Shop wirklich entfolgen?')) return

    startTransition(async () => {
      const result = await unfollowVendor(followId)
      if (result.success) {
        setHiddenIds((prev) => new Set(prev).add(followId))
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const visibleVendors = followedVendors.filter((v) => !hiddenIds.has(v.followId))

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page))
    return `/following?${params.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-vintage-primary rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gefolgte Shops</h1>
            <p className="text-gray-600">{totalCount} Shops gefolgt</p>
          </div>
        </div>
      </div>

      {/* Followed Vendors Grid */}
      {visibleVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleVendors.map((vendor) => (
            <div key={vendor.followId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                    <span className="text-amber-700 font-medium text-lg">
                      {vendor.storeName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.storeName}</h3>
                    {vendor.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={12} />
                        <span>{vendor.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleUnfollow(vendor.followId)}
                  disabled={isPending}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Entfolgen"
                >
                  <UserMinus size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Package size={14} />
                    <span>{vendor.productCount} Produkte</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar size={14} />
                    <span>Seit {new Date(vendor.followedAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>

                {vendor.website && (
                  <div className="flex items-center gap-1 text-sm">
                    <Globe size={14} className="text-gray-400" />
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 truncate"
                    >
                      Website besuchen
                    </a>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  <Link
                    href={`${browse}?vendor=${vendor.vendorId}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Produkte ansehen
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollow(vendor.followId)}
                    disabled={isPending}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    Entfolgen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-vintage-lightGray border-2 border-gray-100  rounded-xl">
          <div className="w-16 h-16 bg-vintage-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Noch keine Shops gefolgt
          </h3>
          <p className="text-gray-600 mb-6">
            Entdecken Sie interessante Vintage-Shops und folgen Sie ihnen
          </p>
          <Link href={browse}>
            <Button>
              Shops entdecken
            </Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Link href={buildPageHref(Math.max(1, currentPage - 1))}>
            <Button variant="outline" size="sm" disabled={currentPage === 1}>
              ‹
            </Button>
          </Link>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
            return (
              <Link key={pageNum} href={buildPageHref(pageNum)}>
                <Button
                  variant="outline"
                  size="sm"
                  className={pageNum === currentPage ? 'bg-gray-900 text-white' : ''}
                >
                  {pageNum}
                </Button>
              </Link>
            )
          })}

          <Link href={buildPageHref(Math.min(totalPages, currentPage + 1))}>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
              ›
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
