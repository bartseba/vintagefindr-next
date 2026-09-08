'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, XCircle, AlertTriangle, Package, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface PackageHistoryItem {
  id: string
  package_name: string
  status: 'active' | 'depleted' | 'expired'
  clicks_total: number
  clicks_used: number
  clicks_remaining: number
  purchased_at: string
  valid_until: string
  extended_at?: string | null
  stripe_order_id?: string | null
}

export interface PackageHistoryData {
  total_packages: number
  total_clicks_used: number
  packages: PackageHistoryItem[]
}

interface PackageHistoryProps {
  history: PackageHistoryData
}

export function PackageHistory({ history }: PackageHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!history || history.total_packages === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusInfo = (pkg: PackageHistoryItem) => {
    if (pkg.status === 'active') {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Aktiv',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      }
    } else if (pkg.status === 'depleted') {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Aufgebraucht',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      }
    } else {
      return {
        icon: <XCircle className="w-4 h-4" />,
        label: 'Abgelaufen',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      }
    }
  }

  const groupPackagesByDate = (packages: PackageHistoryItem[]) => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())

    const groups = {
      lastMonth: [] as PackageHistoryItem[],
      lastQuarter: [] as PackageHistoryItem[],
      older: [] as PackageHistoryItem[],
    }

    packages.forEach(pkg => {
      const endDate = new Date(pkg.valid_until)
      if (endDate >= lastMonth) {
        groups.lastMonth.push(pkg)
      } else if (endDate >= lastQuarter) {
        groups.lastQuarter.push(pkg)
      } else {
        groups.older.push(pkg)
      }
    })

    return groups
  }

  const groups = groupPackagesByDate(history.packages)

  const renderGroup = (title: string, packages: PackageHistoryItem[]) => {
    if (packages.length === 0) return null
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        <div className="space-y-3">
          {packages.map((pkg) => {
            const statusInfo = getStatusInfo(pkg)
            const displayName = pkg.package_name === 'Starter' ? 'Startguthaben' : pkg.package_name

            return (
              <div
                key={pkg.id}
                className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{displayName}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {pkg.clicks_used.toLocaleString()} / {pkg.clicks_total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Klicks verbraucht</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Gekauft am</p>
                    <p className="font-medium text-gray-900">{formatDate(pkg.purchased_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {pkg.status === 'depleted' ? 'Aufgebraucht am' : 'Abgelaufen am'}
                    </p>
                    <p className="font-medium text-gray-900">{formatDate(pkg.valid_until)}</p>
                  </div>
                </div>

                {pkg.extended_at && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Verlängert am {formatDate(pkg.extended_at)}
                    </p>
                  </div>
                )}

                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gray-400"
                    style={{
                      width: `${(pkg.clicks_used / pkg.clicks_total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Paket-Historie</h2>
            <p className="text-sm text-gray-600">
              {history.total_packages} {history.total_packages === 1 ? 'Paket' : 'Pakete'} - {history.total_clicks_used.toLocaleString()} Klicks gesamt verbraucht
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Weniger anzeigen
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Details anzeigen
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Gebuchte Pakete</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{history.total_packages}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Klicks verbraucht</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{history.total_clicks_used.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Durchschn. Laufzeit</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  history.packages.reduce((acc, pkg) => {
                    const start = new Date(pkg.purchased_at)
                    const end = new Date(pkg.valid_until)
                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                    return acc + days
                  }, 0) / history.packages.length
                )} Tage
              </p>
            </div>
          </div>

          {renderGroup('Letzter Monat', groups.lastMonth)}
          {renderGroup('Letztes Quartal', groups.lastQuarter)}
          {renderGroup('Älter', groups.older)}
        </div>
      )}
    </div>
  )
}
