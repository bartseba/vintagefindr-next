'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Calendar,
  BarChart,
  Settings,
} from 'lucide-react'
import { KPICard } from '@/components/KPICard'
import { Button } from '@/components/ui/Button'
import { VendorFooter } from '@/components/VendorFooter'
import { ClickTrendsChart } from '@/components/ClickTrendsChart'

export interface VendorAnalytics {
  totalClicks: number
  uniqueClicks: number
  ctr: number
  impressions: number
  topProducts: Array<{ name: string; clicks: number; change: number }>
  clickTrends: Array<{ date: string; clicks: number }>
  deviceBreakdown: { desktop: number; mobile: number }
  goals: {
    monthlyClicks: { current: number; target: number; percentage: number }
    conversionRate: { current: number; target: number; percentage: number }
  }
  dateRange: {
    start: string
    end: string
    days: number
  }
}

interface VendorAnalyticsViewProps {
  analytics: VendorAnalytics
  storeName: string
}

export function VendorAnalyticsView({ analytics, storeName }: VendorAnalyticsViewProps) {
  const router = useRouter()

  const handleDateRangeChange = (days: string) => {
    router.push(`/vendor/analytics?range=${days}`)
  }

  const exportCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Clicks', analytics.totalClicks],
      ['Unique Clicks', analytics.uniqueClicks],
      ['CTR (%)', analytics.ctr],
      ['Impressions', analytics.impressions],
      ['Date Range', `${analytics.dateRange.start} - ${analytics.dateRange.end}`],
      [''],
      ['Top Products', 'Clicks'],
      ...analytics.topProducts.map((p) => [p.name, p.clicks]),
    ]

    const csvContent = csvData.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${analytics.dateRange.start}-${analytics.dateRange.end}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <header className="bg-white shadow-md border-b-[#EAEAEA] border-b-1 border-solid py-2">
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

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  CSV Export
                </Button>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download size={16} className="mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
              <p className="text-gray-600">{storeName}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => handleDateRangeChange('1')}
                  className={`px-3 py-1 text-sm rounded ${analytics.dateRange.days === 1 ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Heute
                </button>
                <button
                  onClick={() => handleDateRangeChange('7')}
                  className={`px-3 py-1 text-sm rounded ${analytics.dateRange.days === 7 ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  7 Tage
                </button>
                <button
                  onClick={() => handleDateRangeChange('30')}
                  className={`px-3 py-1 text-sm rounded ${analytics.dateRange.days === 30 ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  30 Tage
                </button>
                <button
                  onClick={() => handleDateRangeChange('90')}
                  className={`px-3 py-1 text-sm rounded ${analytics.dateRange.days === 90 ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  90 Tage
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{analytics.dateRange.start} - {analytics.dateRange.end}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Gesamt Clicks"
              value={analytics.totalClicks}
              change={{ value: 12.5, period: `vs vorherige ${analytics.dateRange.days} Tage` }}
              icon={<MousePointerClick className="w-6 h-6 text-blue-600" />}
            />

            <KPICard
              title="Unique Clicks"
              value={analytics.uniqueClicks}
              change={{ value: 8.3, period: `vs vorherige ${analytics.dateRange.days} Tage` }}
              icon={<Users className="w-6 h-6 text-green-600" />}
            />

            <KPICard
              title="CTR"
              value={analytics.ctr}
              format="percentage"
              change={{ value: -2.1, period: `vs vorherige ${analytics.dateRange.days} Tage` }}
              icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            />

            <KPICard
              title="Impressions"
              value={analytics.impressions > 1000 ? `${(analytics.impressions / 1000).toFixed(1)}k` : analytics.impressions}
              change={{ value: 15.2, period: `vs vorherige ${analytics.dateRange.days} Tage` }}
              icon={<Eye className="w-6 h-6 text-amber-600" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Click Trends</h2>
              {analytics.clickTrends.length > 0 ? (
                <div className="space-y-4">
                  <ClickTrendsChart data={analytics.clickTrends} />
                  <div className="text-center text-sm text-gray-600">
                    Klicks über die letzten {analytics.dateRange.days} Tage
                    {analytics.totalClicks === 0 && <span className="block text-gray-400 text-xs mt-1">(Noch keine Klicks vorhanden)</span>}
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Keine Klick-Daten verfügbar</p>
                    <p className="text-gray-400 text-sm">Fügen Sie Produkte hinzu, um Analytics zu sehen</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Top Produkte</h2>
                <Link
                  href="/vendor/products"
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  Alle anzeigen
                </Link>
              </div>

              <div className="space-y-4">
                {analytics.topProducts.length > 0 ? analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-900">
                        {product.clicks}
                      </span>
                      <span className={`text-sm font-medium ${product.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.change > 0 ? '+' : ''}{product.change}%
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-400">📊</span>
                    </div>
                    <p className="text-gray-500 mb-2">Keine Produkt-Klicks</p>
                    <p className="text-gray-400 text-sm">
                      Ihre Top-Produkte werden hier angezeigt, sobald Kunden darauf klicken
                    </p>
                    <Link href="/vendor/products/new" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                      Erstes Produkt hinzufügen
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ziele & Performance</h2>
                <Link
                  href="/vendor/settings#performance-goals"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 transition-colors"
                  title="Ziele anpassen"
                >
                  <Settings size={18} />
                  <span className="hidden sm:inline">Ziele anpassen</span>
                </Link>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Monatliches Click-Ziel</span>
                    <span className="text-sm text-gray-600">
                      {analytics.goals.monthlyClicks.current} / {analytics.goals.monthlyClicks.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analytics.goals.monthlyClicks.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{analytics.goals.monthlyClicks.percentage}% erreicht</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Conversion Rate Ziel</span>
                    <span className="text-sm text-gray-600">
                      {analytics.goals.conversionRate.current}% / {analytics.goals.conversionRate.target}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${analytics.goals.conversionRate.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{analytics.goals.conversionRate.percentage}% erreicht</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Click Breakdown</h2>
                <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                  Details
                </button>
              </div>

              <div className="space-y-4">
                {analytics.totalClicks > 0 ? (
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="flex w-full h-8">
                        <div
                          className="bg-gray-900 h-full flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${analytics.deviceBreakdown.desktop}%` }}
                        >
                          {analytics.deviceBreakdown.desktop > 15 ? 'Desktop' : ''}
                        </div>
                        <div
                          className="bg-gray-400 h-full flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${analytics.deviceBreakdown.mobile}%` }}
                        >
                          {analytics.deviceBreakdown.mobile > 15 ? 'Mobile' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
                        <span className="text-sm text-gray-700">Desktop</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.deviceBreakdown.desktop}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-700">Mobile</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {analytics.deviceBreakdown.mobile}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Keine Gerätedaten</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Optionen</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start" onClick={exportCSV}>
                <Download size={16} className="mr-2" />
                <div className="text-left">
                  <div className="font-medium">CSV Export</div>
                  <div className="text-sm text-gray-500">Alle Analytics Daten ({analytics.dateRange.start} - {analytics.dateRange.end})</div>
                </div>
              </Button>

              <Button variant="outline" className="justify-start" onClick={() => window.print()}>
                <Download size={16} className="mr-2" />
                <div className="text-left">
                  <div className="font-medium">PDF Report</div>
                  <div className="text-sm text-gray-500">Drucken/PDF speichern</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <VendorFooter />
    </>
  )
}
