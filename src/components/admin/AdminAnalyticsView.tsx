'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  MousePointerClick,
  Eye,
  Users,
  TrendingUp,
  Search,
  LogOut,
  Store,
  Monitor,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { logoutAdmin } from '@/app/admin/dashboard/actions'

export interface ClickData {
  id: string
  vendorId: string
  vendorName: string
  vendorStoreName: string
  productId: string
  productTitle: string
  ipHash: string
  clickedAt: string
  referer: string | null
  userAgent: string | null
  deviceType: 'desktop' | 'mobile' | 'unknown'
}

interface AdminAnalyticsViewProps {
  clicks: ClickData[]
  totalCount: number
  currentPage: number
  totalPages: number
  stats: {
    totalClicks: number
    uniqueIPs: number
    topVendors: Array<{ name: string; clicks: number }>
    clicksInPeriod: number
  }
  vendors: Array<{ id: string; name: string; storeName: string }>
  filters: { vendor: string; range: string; search: string }
  dateRange: { start: string; end: string; days: number }
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function AdminAnalyticsView({ clicks, totalCount, currentPage, totalPages, stats, vendors, filters, dateRange }: AdminAnalyticsViewProps) {
  const router = useRouter()
  const [selectedClick, setSelectedClick] = useState<ClickData | null>(null)
  const [exportVendorId, setExportVendorId] = useState<string>('all')

  const buildUrl = (overrides: { vendor?: string; range?: string; search?: string; page?: string }) => {
    const combined = { vendor: filters.vendor, range: filters.range, search: filters.search, page: String(currentPage), ...overrides }
    const params = new URLSearchParams()
    if (combined.search) params.set('search', combined.search)
    if (combined.vendor && combined.vendor !== 'all') params.set('vendor', combined.vendor)
    if (combined.range && combined.range !== '30') params.set('range', combined.range)
    if (combined.page && combined.page !== '1') params.set('page', combined.page)
    const qs = params.toString()
    return qs ? `/admin/analytics?${qs}` : '/admin/analytics'
  }

  const handleFilterChange = (key: 'vendor' | 'range', value: string) => {
    router.push(buildUrl({ [key]: value === 'all' ? undefined : value, page: undefined }))
  }

  const getRangeButtonClass = (range: string) => {
    const isActive = filters.range === range
    return `px-3 py-1 text-sm rounded transition-colors ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`
  }

  const truncateHash = (hash: string, length: number = 16) => {
    if (!hash || hash === 'unknown') return 'Unbekannt'
    return hash.length > length ? `${hash.substring(0, length)}...` : hash
  }

  const extractDomain = (url: string | null) => {
    if (!url) return 'Direkt'
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return url.length > 30 ? `${url.substring(0, 30)}...` : url
    }
  }

  const exportCSV = (vendorId: string = 'all') => {
    const vendorName = vendorId === 'all'
      ? 'alle-haendler'
      : vendors.find((v) => v.id === vendorId)?.storeName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'haendler'

    const clicksToExport = vendorId === 'all'
      ? clicks
      : clicks.filter((c) => c.vendorId === vendorId)

    if (clicksToExport.length === 0) {
      alert('Keine Daten zum Exportieren verfügbar.')
      return
    }

    const csvData = [
      ['Händler', 'Produkt-ID', 'Produkt-Titel', 'IP-Hash (SHA-256)', 'Timestamp', 'Referrer', 'User-Agent', 'Gerätetyp'],
      ...clicksToExport.map((click) => [
        click.vendorStoreName,
        click.productId,
        click.productTitle,
        click.ipHash,
        click.clickedAt,
        click.referer || 'Direkt',
        click.userAgent || 'Unbekannt',
        click.deviceType === 'mobile' ? 'Mobile' : click.deviceType === 'desktop' ? 'Desktop' : 'Unbekannt',
      ]),
    ]

    const csvContent = '﻿' + csvData.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    a.download = `klickdaten-${vendorName}-${dateStr}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportAllFiltered = () => {
    const confirmed = totalCount > 1000
      ? confirm(`Sie möchten ${totalCount} Einträge exportieren. Möchten Sie fortfahren?`)
      : true

    if (confirmed) {
      exportCSV(filters.vendor)
    }
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
                <span>Analytics</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={exportAllFiltered}>
                <Download size={16} className="mr-2" />
                CSV Export
              </Button>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Click Analytics</h1>
              <p className="text-gray-600">Übersicht aller Klick-Daten ({dateRange.start} - {dateRange.end})</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Datenschutz-Hinweis:</strong> Alle IP-Adressen sind irreversibel mit SHA-256 gehasht (DSGVO-konform gemäß Art. 6(1)(f) und Art. 5(1)(c)).
              Diese Daten dürfen nur für berechtigte Zwecke verwendet werden.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <MousePointerClick className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalClicks}</div>
              <div className="text-sm text-gray-600">Gesamt-Klicks</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.uniqueIPs}</div>
              <div className="text-sm text-gray-600">Unique IPs</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Store className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.topVendors.length}</div>
              <div className="text-sm text-gray-600">Aktive Händler</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.clicksInPeriod}</div>
              <div className="text-sm text-gray-600">Klicks ({dateRange.days}d)</div>
            </div>
          </div>

          {stats.topVendors.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Händler</h2>
              <div className="space-y-3">
                {stats.topVendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <span className="text-amber-700 font-medium text-sm">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{vendor.name}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{vendor.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <form method="get" action="/admin/analytics" className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  name="search"
                  placeholder="Suche nach IP-Hash, Referrer oder User-Agent..."
                  className="pl-10"
                  defaultValue={filters.search}
                />
              </form>
            </div>

            <div className="flex gap-2">
              <select
                value={filters.vendor}
                onChange={(e) => handleFilterChange('vendor', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">Alle Händler</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.storeName}
                  </option>
                ))}
              </select>

              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button onClick={() => handleFilterChange('range', '1')} className={getRangeButtonClass('1')}>
                  Heute
                </button>
                <button onClick={() => handleFilterChange('range', '7')} className={getRangeButtonClass('7')}>
                  7T
                </button>
                <button onClick={() => handleFilterChange('range', '30')} className={getRangeButtonClass('30')}>
                  30T
                </button>
                <button onClick={() => handleFilterChange('range', '90')} className={getRangeButtonClass('90')}>
                  90T
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Händler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP-Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clicks.map((click) => (
                  <tr key={click.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{click.vendorStoreName}</div>
                      <div className="text-xs text-gray-500">{click.vendorName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={click.productTitle}>
                        {click.productTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded" title={click.ipHash}>
                        {truncateHash(click.ipHash)}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(click.clickedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(click.clickedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={click.referer || 'Direkt'}>
                        {extractDomain(click.referer)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {click.deviceType === 'mobile' ? (
                          <Smartphone size={16} className="text-gray-600" />
                        ) : click.deviceType === 'desktop' ? (
                          <Monitor size={16} className="text-gray-600" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <span className="text-sm text-gray-600 capitalize">{click.deviceType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClick(click)}
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clicks.length === 0 && (
            <div className="text-center py-16">
              <MousePointerClick className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Klicks gefunden
              </h3>
              <p className="text-gray-600">
                {filters.search || filters.vendor !== 'all'
                  ? 'Keine Klicks entsprechen Ihren Suchkriterien.'
                  : 'Im ausgewählten Zeitraum wurden noch keine Klicks registriert.'}
              </p>
            </div>
          )}
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

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export pro Händler</h2>
          <div className="flex items-center gap-4">
            <select
              value={exportVendorId}
              onChange={(e) => setExportVendorId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">Alle Händler</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.storeName}
                </option>
              ))}
            </select>
            <Button onClick={() => exportCSV(exportVendorId)}>
              <Download size={16} className="mr-2" />
              CSV Export
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Exportiert werden nur die Klicks des ausgewählten Händlers im aktuellen Zeitraum ({dateRange.start} - {dateRange.end})
          </p>
        </div>
      </div>

      {selectedClick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Click Details</h2>
              <button
                onClick={() => setSelectedClick(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Händler Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Store:</span>
                    <span className="font-medium text-gray-900">{selectedClick.vendorStoreName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{selectedClick.vendorName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Produkt Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Titel:</span>
                    <span className="font-medium text-gray-900">{selectedClick.productTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <code className="text-xs bg-white px-2 py-1 rounded">{selectedClick.productId}</code>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Click Daten</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">IP-Hash:</span>
                    <code className="text-xs bg-white px-2 py-1 rounded break-all max-w-xs">{selectedClick.ipHash}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(selectedClick.clickedAt)} {formatTime(selectedClick.clickedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Referrer:</span>
                    <span className="font-medium text-gray-900 break-all max-w-xs text-right">
                      {selectedClick.referer || 'Direkt'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">User-Agent:</span>
                    <span className="font-medium text-gray-900 text-xs break-all max-w-xs text-right">
                      {selectedClick.userAgent || 'Unbekannt'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Device:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedClick.deviceType}</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setSelectedClick(null)}>
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
