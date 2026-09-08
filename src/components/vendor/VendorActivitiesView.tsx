'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit,
  MousePointerClick,
  CreditCard,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { VendorFooter } from '@/components/VendorFooter'

export type ActivityType = 'product_added' | 'product_updated' | 'click' | 'package_purchased' | 'impression'

export interface ActivityItem {
  id: string
  type: ActivityType
  message: string
  time: string
  timestamp: number
}

interface VendorActivitiesViewProps {
  activities: ActivityItem[]
  totalActivities: number
  currentPage: number
  totalPages: number
  filterType: string
  filterDays: string
}

export function VendorActivitiesView({
  activities,
  totalActivities,
  currentPage,
  totalPages,
  filterType,
  filterDays,
}: VendorActivitiesViewProps) {
  const router = useRouter()

  const buildUrl = (overrides: { type?: string; days?: string; page?: string }) => {
    const params = new URLSearchParams()
    const combined = { type: filterType, days: filterDays, page: String(currentPage), ...overrides }
    if (combined.type && combined.type !== 'all') params.set('type', combined.type)
    if (combined.days && combined.days !== '30') params.set('days', combined.days)
    if (combined.page && combined.page !== '1') params.set('page', combined.page)
    const qs = params.toString()
    return qs ? `/vendor/activities?${qs}` : '/vendor/activities'
  }

  const handleFilterChange = (type: string, value: string) => {
    router.push(buildUrl({ [type]: value, page: '1' }))
  }

  const handlePageChange = (newPage: number) => {
    router.push(buildUrl({ page: String(newPage) }))
  }

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'product_added':
        return <Plus className="w-5 h-5 text-green-600" />
      case 'product_updated':
        return <Edit className="w-5 h-5 text-blue-600" />
      case 'click':
        return <MousePointerClick className="w-5 h-5 text-purple-600" />
      case 'package_purchased':
        return <CreditCard className="w-5 h-5 text-orange-600" />
      case 'impression':
        return <Eye className="w-5 h-5 text-teal-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'product_added':
        return 'bg-green-50 border-green-200'
      case 'product_updated':
        return 'bg-blue-50 border-blue-200'
      case 'click':
        return 'bg-purple-50 border-purple-200'
      case 'package_purchased':
        return 'bg-orange-50 border-orange-200'
      case 'impression':
        return 'bg-teal-50 border-teal-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/vendor/dashboard" className="flex items-center gap-2">
              <Logo />
            </Link>
            <Link href="/vendor/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zum Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alle Aktivitäten</h1>
          <p className="text-gray-600">Übersicht über alle Ihre Aktivitäten und Ereignisse</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Aktivitätstyp
              </label>
              <select
                value={filterType}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">Alle Aktivitäten</option>
                <option value="products">Produkte</option>
                <option value="clicks">Klicks</option>
                <option value="impressions">Ansichten</option>
                <option value="packages">Pakete</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Zeitraum
              </label>
              <select
                value={filterDays}
                onChange={(e) => handleFilterChange('days', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="1">Heute</option>
                <option value="7">Letzte 7 Tage</option>
                <option value="30">Letzte 30 Tage</option>
                <option value="90">Letzte 90 Tage</option>
                <option value="0">Alle</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {totalActivities} {totalActivities === 1 ? 'Aktivität' : 'Aktivitäten'} gefunden
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Aktivitäten gefunden</h3>
            <p className="text-gray-600">
              Für den gewählten Zeitraum und Filter wurden keine Aktivitäten gefunden.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${getActivityColor(activity.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === currentPage
                              ? 'bg-black text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-gray-400">...</span>
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <VendorFooter />
    </div>
  )
}
