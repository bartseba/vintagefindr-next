import Link from 'next/link'
import {
  Plus,
  Upload,
  BarChart3,
  Settings,
  Eye,
  MousePointerClick,
  TrendingUp,
  Package,
  LogOut,
  CreditCard,
  Receipt,
  Mail,
  List,
  AlertTriangle,
  Clock,
  SquareArrowOutUpRight,
} from 'lucide-react'
import { requireVendorAuth } from '@/lib/auth/session'
import { KPICard } from '@/components/KPICard'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { VendorFooter } from '@/components/VendorFooter'
import { PackageHistory, type PackageHistoryData } from '@/components/PackageHistory'
import { ShopifyConnectionCard } from '@/components/ShopifyConnectionCard'
import { ExtensionRequestButton } from '@/components/vendor/ExtensionRequestButton'
import { companyName } from '@/constant/routes'
import type { VendorPackageInfo } from '@/types/vendor-packages'
import { logoutVendor } from './actions'

interface DashboardProductRow {
  id: string
  title: string
  created_at: string
}

interface ProductClickRow {
  id: string
  clicked_at: string
  product_id: string
  products: { title: string; price: number; condition: string } | null
}

export default async function VendorDashboardPage() {
  const { supabase, vendor } = await requireVendorAuth()

  const shopifyStatus = {
    connected: false,
    shopDomain: null as string | null,
    installedAt: null as string | null,
    syncStatus: null as string | null,
    syncedProducts: 0,
  }

  const { data: shopifyData } = await supabase
    .from('vendors')
    .select('shopify_domain, shopify_installed_at, shopify_sync_status')
    .eq('id', vendor.id)
    .maybeSingle()

  if (shopifyData) {
    shopifyStatus.shopDomain = shopifyData.shopify_domain
    shopifyStatus.connected = !!shopifyData.shopify_installed_at
    shopifyStatus.installedAt = shopifyData.shopify_installed_at
    shopifyStatus.syncStatus = shopifyData.shopify_sync_status

    if (shopifyData.shopify_installed_at) {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id)
        .eq('source', 'shopify')
        .eq('deleted', false)
      shopifyStatus.syncedProducts = count || 0
    }
  }

  const { data: packageInfoData } = await supabase
    .rpc('get_vendor_package_info', { p_vendor_id: vendor.id })
  const packageInfo = packageInfoData as VendorPackageInfo | null

  const { data: packageHistoryData } = await supabase
    .rpc('get_vendor_package_history', { p_vendor_id: vendor.id })
  const packageHistory = packageHistoryData as PackageHistoryData | null

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.id)
    .eq('is_active', true)
    .eq('deleted', false)
    .order('created_at', { ascending: false })
    .limit(10)

  const products = (productsData || []) as DashboardProductRow[]

  const { count: totalProductsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id)
    .eq('deleted', false)

  const { count: publishedProductsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id)
    .eq('is_active', true)
    .eq('deleted', false)

  const totalProducts = totalProductsCount || 0
  const publishedProducts = publishedProductsCount || 0

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { data: allClicksData } = await supabase
    .from('product_clicks')
    .select('id, clicked_at, product_id, products(title, price, condition)')
    .eq('vendor_id', vendor.id)
    .gte('clicked_at', monthStart.toISOString())

  const clicksData = (allClicksData || []) as unknown as ProductClickRow[]

  const todayStartTime = todayStart.getTime()
  const weekStartTime = weekStart.getTime()

  let todayClicks = 0
  let weeklyClicks = 0
  const productClickCounts = new Map<string, { name: string; clicks: number; price: number; condition: string }>()

  clicksData.forEach((click) => {
    const clickTime = new Date(click.clicked_at).getTime()

    if (clickTime >= todayStartTime) todayClicks++
    if (clickTime >= weekStartTime) weeklyClicks++

    const productTitle = click.products?.title || 'Unknown'
    const existing = productClickCounts.get(productTitle)
    if (existing) {
      existing.clicks++
    } else {
      productClickCounts.set(productTitle, {
        name: productTitle,
        clicks: 1,
        price: click.products?.price || 0,
        condition: click.products?.condition || 'Unknown',
      })
    }
  })

  const topProducts = Array.from(productClickCounts.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 4)

  const recentActivity = products.slice(0, 3).map((product) => ({
    type: 'product_added',
    message: `Produkt "${product.title}" hinzugefügt`,
    time: new Date(product.created_at).toLocaleDateString('de-DE'),
  }))

  const stats = {
    totalProducts,
    publishedProducts,
    todayClicks,
    weeklyClicks,
    monthlyClicks: clicksData.length,
    topProducts,
    recentActivity,
  }

  const vendorView = {
    id: vendor.id,
    name: `${vendor.first_name} ${vendor.last_name}`,
    storeName: vendor.store_name,
    initials: `${vendor.first_name.charAt(0)}${vendor.last_name.charAt(0)}`,
    status: vendor.status,
    avatarUrl: vendor.avatar_url,
    isActive: vendor.is_active,
    pausedAt: vendor.paused_at,
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <header className="bg-white shadow-md border-b-[#EAEAEA] border-b-1 border-solid py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4 mr-2">
                <Logo />
              </div>

              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <SquareArrowOutUpRight className="lg:mr-2 h-5 w-5" />
                    <span className="hidden lg:block">
                      Zur Webseite
                    </span>
                  </Button>
                </Link>
                <Link href="/vendor/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="lg:mr-2 h-5 w-5" />
                    <span className="hidden lg:block">
                      Einstellungen
                    </span>
                  </Button>
                </Link>

                <form action={logoutVendor}>
                  <button type="submit" className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:border-gray-400 bg-transparent text-gray-700 focus:ring-gray-500 px-3 py-1.5 text-sm">
                    <LogOut size={16} className="mr-2" />
                    Abmelden
                  </button>
                </form>
                <div className="w-12 h-12 bg-vintage-primary rounded-full flex items-center justify-center overflow-hidden">
                  {vendorView.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote avatar, matches AvatarUpload's existing plain-<img> approach
                    <img
                      src={vendorView.avatarUrl}
                      alt={vendorView.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium text-sm">{vendorView.initials}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Willkommen zurück, {vendorView.name.length > 2 ? vendorView.name : vendorView.storeName}!
            </h1>
            <p className="text-gray-600">
              {vendorView.storeName} - Hier ist deine Performance im Überblick
            </p>
          </div>

          {!vendorView.isActive && (
            <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-amber-800">
                    Account ist pausiert
                  </h3>
                  <p className="mt-2 text-sm text-amber-700">
                    Ihr Account ist derzeit pausiert. Ihre Produkte sind nicht öffentlich sichtbar und erscheinen nicht in Suchergebnissen.
                    Sie können Ihren Account jederzeit in den Einstellungen wieder aktivieren.
                  </p>
                  {vendorView.pausedAt && (
                    <div className="mt-3">
                      <p className="text-xs text-amber-600 font-medium">
                        ⏸ Pausiert seit {new Date(vendorView.pausedAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                  <div className="mt-4">
                    <Link href="/vendor/settings">
                      <Button size="sm" variant="primary">
                        Account aktivieren
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {vendorView.status === 'pending' && (
            <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-blue-800">
                    Account wartet auf Freigabe
                  </h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Dein Vendor-Account wird derzeit von unserem Team geprüft. Sobald dein Account freigeschaltet wurde,
                    sind deine Produkte auf {companyName} verfügbar. Wir melden uns in Kürze bei dir!
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-blue-600 font-medium">
                      ⏱ Status: Wird überprüft
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {vendorView.status === 'rejected' && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-red-800">
                    Account nicht freigegeben
                  </h3>
                  <p className="mt-2 text-sm text-red-700">
                    Leider konnten wir deinen Vendor-Account nicht freischalten.
                    Bitte kontaktiere unseren Support für weitere Informationen.
                  </p>
                  <div className="mt-4">
                    <Link href="/kontakt">
                      <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                        Support kontaktieren
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!packageInfo?.has_active_package ? (
            <div className="mb-8 bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-orange-900">
                    Kein aktives Paket - Produkte nicht sichtbar
                  </h3>
                  <p className="mt-2 text-sm text-orange-800 font-semibold">
                    Ohne aktives Paket werden Ihre Produkte NICHT öffentlich angezeigt.
                  </p>
                  <p className="mt-2 text-sm text-orange-700">
                    Besucher können Ihre Produkte nicht finden oder sehen. Um auf {companyName} sichtbar zu werden und Klicks auf Ihre Produkte zu erhalten,
                    müssen Sie ein Klickpaket buchen.
                  </p>
                  <div className="mt-4">
                    <Link href="/vendor/pricetable">
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                        Jetzt Paket buchen und sichtbar werden
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {(() => {
                const totalClicksRemaining = packageInfo.packages?.reduce((sum, pkg) => sum + pkg.clicks_remaining, 0) || 0
                const totalClicksTotal = packageInfo.packages?.reduce((sum, pkg) => sum + pkg.clicks_total, 0) || 0
                const totalPercentage = totalClicksTotal > 0 ? (totalClicksRemaining / totalClicksTotal) * 100 : 0

                return (
                  <>
                    {totalPercentage <= 10 && totalPercentage > 0 && (
                      <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-7 w-7 text-red-600" />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-lg font-bold text-red-900">
                              Nur noch {totalPercentage.toFixed(1)}% Klickguthaben verfügbar!
                            </h3>
                            <div className="mt-3 p-4 bg-white border border-red-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-red-900">Gesamtguthaben</span>
                                <span className="text-red-700 font-bold text-lg">{totalPercentage.toFixed(1)}%</span>
                              </div>
                              <p className="text-sm text-red-800">
                                <span className="font-bold">{totalClicksRemaining}</span> von {totalClicksTotal} Klicks verbleibend
                              </p>
                            </div>
                            <p className="mt-3 text-sm text-red-800 font-semibold">
                              Wenn Ihr Klickguthaben aufgebraucht ist, werden Ihre Produkte automatisch ausgeblendet!
                            </p>
                            <div className="mt-4">
                              <Link href="/vendor/pricetable">
                                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                                  Jetzt Klicks nachbuchen
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {totalPercentage <= 50 && totalPercentage > 10 && (
                      <div className="mb-4 bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-orange-500" />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-lg font-medium text-orange-900">
                              {totalPercentage.toFixed(0)}% Ihres Klickguthabens verbraucht
                            </h3>
                            <div className="mt-3 p-4 bg-white border border-orange-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-orange-900">Gesamtguthaben</span>
                                <span className="text-orange-700 font-bold text-lg">{totalPercentage.toFixed(1)}%</span>
                              </div>
                              <p className="text-sm text-orange-800">
                                <span className="font-bold">{totalClicksRemaining}</span> von {totalClicksTotal} Klicks verbleibend
                              </p>
                            </div>
                            <p className="mt-3 text-sm text-orange-800">
                              Buchen Sie rechtzeitig ein neues Paket, damit Ihre Produkte weiterhin sichtbar bleiben.
                            </p>
                            <div className="mt-4">
                              <Link href="/vendor/pricetable">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                                  Jetzt Paket buchen
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              {packageInfo.packages?.some((pkg) => {
                if (pkg.package_name === 'Starter') {
                  const daysUntilExpiry = Math.ceil((new Date(pkg.valid_until).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  return daysUntilExpiry <= 14 && daysUntilExpiry > 0
                }
                return false
              }) && (
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-blue-900">
                        Ihr Startguthaben läuft bald ab
                      </h3>
                      <p className="mt-2 text-sm text-blue-800">
                        Ihr Startguthaben läuft in{' '}
                        <span className="font-bold">
                          {Math.ceil((new Date(packageInfo.packages?.find((p) => p.package_name === 'Starter')?.valid_until || '').getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}
                        </span> Tag(en) ab. Buchen Sie rechtzeitig ein Paket, damit Ihre Produkte weiterhin sichtbar bleiben.
                      </p>
                      <div className="mt-4">
                        <Link href="/vendor/pricetable">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Jetzt Paket buchen
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-green-800">
                        {packageInfo.packages?.every((pkg) => pkg.package_name === 'Starter')
                          ? 'Startguthaben verfügbar'
                          : 'Paket aktiv'}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">{packageInfo.total_clicks_remaining?.toLocaleString()}</span> Klicks insgesamt verfügbar
                        </p>
                        {packageInfo.packages?.map((pkg) => {
                          const displayName = pkg.package_name === 'Starter' ? 'Startguthaben' : pkg.package_name
                          const daysUntilExpiry = Math.ceil((new Date(pkg.valid_until).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                          return (
                            <div key={pkg.id} className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-green-800">{displayName}</span>
                                <div className="text-right">
                                  <span className="text-xs text-green-600 block">
                                    Gültig bis {new Date(pkg.valid_until).toLocaleDateString('de-DE')}
                                  </span>
                                  {daysUntilExpiry <= 30 && (
                                    <span className="text-xs text-orange-600 block">
                                      (noch {daysUntilExpiry} Tag{daysUntilExpiry !== 1 ? 'e' : ''})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-green-700 mb-2">
                                <span className="font-semibold">{pkg.clicks_remaining.toLocaleString()}</span> von{' '}
                                <span className="font-semibold">{pkg.clicks_total.toLocaleString()}</span> Klicks
                              </p>
                              <div className="w-full bg-green-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    pkg.clicks_remaining / pkg.clicks_total < 0.2 ? 'bg-orange-500' : 'bg-green-600'
                                  }`}
                                  style={{
                                    width: `${(pkg.clicks_remaining / pkg.clicks_total) * 100}%`,
                                  }}
                                />
                              </div>
                              {pkg.package_name === 'Starter' && (
                                <p className="text-xs text-gray-600 mt-2 italic">
                                  Einmalig, 12 Monate gültig, nicht übertragbar *
                                </p>
                              )}

                              {pkg.package_name !== 'Starter' && (
                                <ExtensionRequestButton packageId={pkg.id} packageName={pkg.package_name} validUntil={pkg.valid_until} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <Link href="/vendor/pricetable">
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      Weiteres Paket buchen
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 mb-8">
                * Sobald Ihr Guthaben aufgebraucht ist, werden Ihre Produkte nicht mehr öffentlich angezeigt. Buchen Sie rechtzeitig ein Paket, um die Sichtbarkeit zu gewährleisten.
              </p>
            </>
          )}

          {packageHistory && <PackageHistory history={packageHistory} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Heute"
              value={stats.todayClicks}
              change={{ value: 12, period: 'vs gestern' }}
              icon={<Eye className="w-6 h-6 text-amber-600" />}
            />

            <KPICard
              title="7 Tage"
              value={stats.weeklyClicks}
              change={{ value: 8, period: 'vs letzte Woche' }}
              icon={<MousePointerClick className="w-6 h-6 text-blue-600" />}
            />

            <KPICard
              title="30 Tage"
              value={stats.monthlyClicks}
              change={{ value: -3, period: 'vs letzter Monat' }}
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            />
            <KPICard
              link="/vendor/products"
              title="Produkte"
              value={`${stats.publishedProducts}/${stats.totalProducts}`}
              icon={<Package className="w-6 h-6 text-purple-600" />}
            />
          </div>

          <div className="mb-8">
            <ShopifyConnectionCard
              connected={shopifyStatus.connected}
              shopDomain={shopifyStatus.shopDomain}
              installedAt={shopifyStatus.installedAt}
              syncStatus={shopifyStatus.syncStatus}
              syncedProducts={shopifyStatus.syncedProducts}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellzugriff</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/vendor/products" className="group">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <List className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Alle Produkte</h3>
                    <p className="text-sm text-gray-600">Produkte verwalten</p>
                  </div>
                </div>
              </Link>

              <Link href="/vendor/products/new" className="group">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Produkt hinzufügen</h3>
                    <p className="text-sm text-gray-600">Neues Produkt erstellen</p>
                  </div>
                </div>
              </Link>

              <Link href="/vendor/import" className="group">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">CSV Import</h3>
                    <p className="text-sm text-gray-600">Bulk-Upload starten</p>
                  </div>
                </div>
              </Link>

              <Link href="/vendor/analytics" className="group">
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

              <Link href="/vendor/pricetable" className="group">
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors border border-amber-200">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Pakete & Preise</h3>
                    <p className="text-sm text-gray-600">Paket buchen</p>
                  </div>
                </div>
              </Link>

              <Link href="/vendor/billing-portal" className="group">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Rechnungen & Zahlungen</h3>
                    <p className="text-sm text-gray-600">Zahlungshistorie verwalten</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                      <span className="text-amber-700 font-medium text-sm">
                        {product.name.split(' ')[0].charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        €{product.price} • {product.condition}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {product.clicks}
                      </p>
                      <p className="text-xs text-gray-500">Klicks</p>
                    </div>
                  </div>
                ))}

                {stats.topProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Noch keine Produkte</p>
                    <Link href="/vendor/products/new">
                      <Button size="sm">
                        <Plus size={14} className="mr-2" />
                        Erstes Produkt hinzufügen
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Letzte Aktivitäten
              </h2>

              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}

                {stats.recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-gray-400">📝</span>
                    </div>
                    <p className="text-gray-500">Noch keine Aktivitäten</p>
                  </div>
                )}
              </div>

              <Link href="/vendor/activities" className="block w-full mt-6">
                <Button variant="outline" className="w-full">
                  Alle Aktivitäten anzeigen
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Feedback oder Feature-Wünsche?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Vermissen Sie eine Funktion oder haben Sie Vorschläge zur Verbesserung?
                  Wir freuen uns auf Ihre Nachricht!
                </p>
                <a
                  href="mailto:kontakt@vintagefindr.de?subject=Feedback%20Vendor%20Dashboard"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  kontakt@vintagefindr.de
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <VendorFooter />
    </>
  )
}
