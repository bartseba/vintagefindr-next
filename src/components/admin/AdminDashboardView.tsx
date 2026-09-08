'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Package,
  MousePointerClick,
  Store,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Calendar,
  Activity,
  Lightbulb,
  Shield,
  LogOut,
} from 'lucide-react'
import { KPICard } from '@/components/KPICard'
import { Button } from '@/components/ui/Button'
import { companyName } from '@/constant/routes'
import { logoutAdmin, approveVendor, rejectVendor } from '@/app/admin/dashboard/actions'

export interface AdminDashboardData {
  stats: {
    totalVendors: number
    pendingVendors: number
    approvedVendors: number
    totalProducts: number
    activeProducts: number
    totalClicks: number
    totalUsers: number
    monthlyRevenue: number
    pendingSuggestions: number
    newDsaReports: number
    pendingExtensionRequests: number
  }
  recentVendors: Array<{
    id: string
    name: string
    storeName: string
    email: string
    status: string
    createdAt: string
    location: string | null
  }>
  topProducts: Array<{
    id: string
    title: string
    vendorName: string
    price: number
    clicks: number
    status: string
  }>
  recentActivity: Array<{
    id: string
    action: string
    target: string
    admin: string
    timestamp: string
  }>
  vendorApplications: Array<{
    id: string
    store_name: string
    first_name: string
    last_name: string
    email: string
    created_at: string
  }>
  systemHealth: {
    uptime: string
    responseTime: string
    errorRate: string
  }
}

interface AdminDashboardViewProps {
  dashboardData: AdminDashboardData
}

export function AdminDashboardView({ dashboardData }: AdminDashboardViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleVendorAction = (vendorId: string, action: 'approve_vendor' | 'reject_vendor') => {
    startTransition(async () => {
      if (action === 'approve_vendor') {
        await approveVendor(vendorId)
      } else {
        await rejectVendor(vendorId)
      }
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-amber-600">{companyName}</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Admin Dashboard</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings size={16} className="mr-2" />
                Einstellungen
              </Button>
              <form action={logoutAdmin}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut size={16} className="mr-2" />
                  Abmelden
                </Button>
              </form>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-medium text-sm">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Übersicht über alle Vendors, Produkte und Systemaktivitäten
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Gesamt Vendors"
            value={dashboardData.stats.totalVendors}
            change={{ value: 12, period: 'vs letzter Monat' }}
            icon={<Store className="w-6 h-6 text-blue-600" />}
          />

          <KPICard
            title="Ausstehende Anträge"
            value={dashboardData.stats.pendingVendors}
            change={{ value: -5, period: 'vs letzte Woche' }}
            icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
          />

          <KPICard
            link="/admin/products"
            title="Aktive Produkte"
            value={dashboardData.stats.activeProducts}
            change={{ value: 18, period: 'vs letzter Monat' }}
            icon={<Package className="w-6 h-6 text-green-600" />}
          />

          <KPICard
            title="Gesamt Klicks"
            value={dashboardData.stats.totalClicks}
            change={{ value: 25, period: 'vs letzter Monat' }}
            icon={<MousePointerClick className="w-6 h-6 text-purple-600" />}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellzugriff</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/vendors" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Vendors verwalten</h3>
                  <p className="text-sm text-gray-600">{dashboardData.stats.pendingVendors} ausstehend</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/products" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Produkte überwachen</h3>
                  <p className="text-sm text-gray-600">{dashboardData.stats.totalProducts} gesamt</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/collections" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Collections</h3>
                  <p className="text-sm text-gray-600">Kuratierte Produkte</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/analytics" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Detaillierte Berichte</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/extension-requests" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Verlängerungsanträge</h3>
                  <p className="text-sm text-gray-600">
                    {dashboardData.stats.pendingExtensionRequests > 0
                      ? `${dashboardData.stats.pendingExtensionRequests} ausstehend`
                      : 'Keine ausstehend'}
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/admin/suggestions" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Vorschläge prüfen</h3>
                  <p className="text-sm text-gray-600">
                    {dashboardData.stats.pendingSuggestions > 0
                      ? `${dashboardData.stats.pendingSuggestions} ausstehend`
                      : 'Keine ausstehend'}
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/admin/dsa-reports" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">DSA-Meldungen</h3>
                  <p className="text-sm text-gray-600">
                    {dashboardData.stats.newDsaReports > 0
                      ? `${dashboardData.stats.newDsaReports} neue Meldung${dashboardData.stats.newDsaReports > 1 ? 'en' : ''}`
                      : 'Keine neuen Meldungen'}
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/admin/settings" className="group">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">System Einstellungen</h3>
                  <p className="text-sm text-gray-600">Konfiguration</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Vendor Anträge</h2>
              <Link
                href="/admin/vendors"
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Alle anzeigen
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.vendorApplications.slice(0, 5).map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                      <span className="text-amber-700 font-medium text-sm">
                        {vendor.store_name.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">
                        {vendor.store_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {vendor.first_name} {vendor.last_name} • {vendor.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(vendor.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleVendorAction(vendor.id, 'approve_vendor')}
                      disabled={isPending}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Genehmigen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVendorAction(vendor.id, 'reject_vendor')}
                      disabled={isPending}
                    >
                      <XCircle size={14} className="mr-1" />
                      Ablehnen
                    </Button>
                  </div>
                </div>
              ))}

              {dashboardData.vendorApplications.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">Keine ausstehenden Anträge</p>
                  <p className="text-gray-400 text-sm">
                    Alle Vendor-Anträge sind bearbeitet
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Top Produkte</h2>
              <Link
                href="/admin/products"
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Alle anzeigen
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 truncate max-w-48">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product.vendorName} • €{product.price}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {product.clicks}
                    </p>
                    <p className="text-xs text-gray-500">Klicks</p>
                  </div>
                </div>
              ))}

              {dashboardData.topProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Keine Produkte verfügbar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Uptime</span>
                </div>
                <span className="font-medium text-gray-900">{dashboardData.systemHealth.uptime}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Response Time</span>
                </div>
                <span className="font-medium text-gray-900">{dashboardData.systemHealth.responseTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Error Rate</span>
                </div>
                <span className="font-medium text-gray-900">{dashboardData.systemHealth.errorRate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Letzte Aktivitäten
            </h2>

            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      {activity.action}: {activity.target}
                    </p>
                    <p className="text-sm text-gray-500">
                      von {activity.admin} • {new Date(activity.timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(activity.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {dashboardData.recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Keine Aktivitäten</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
