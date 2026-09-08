'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Store, Globe, Settings as SettingsIcon, Target, Receipt, ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AvatarUpload } from '@/components/AvatarUpload'
import { DeleteAccountModal } from '@/components/DeleteAccountModal'
import { ShopifyDomainModal } from '@/components/ShopifyDomainModal'
import {
  updateVendorSettings,
  pauseAccount,
  activateAccount,
  deleteVendorAccount,
  updateShopifyDomain,
  type UpdateSettingsState,
} from '@/app/vendor/settings/actions'

export interface SettingsVendor {
  id: string
  firstName: string
  lastName: string
  email: string
  storeName: string
  storeWebsite: string | null
  storeLocation: string | null
  ecommercePlatform: string | null
  inventorySystem: string | null
  numberOfItems: number | null
  status: string
  createdAt: string
  monthlyClickGoal: number
  ctrGoal: number
  avatarUrl: string | null
  isActive: boolean
  pausedAt: string | null
  shopifyDomain: string | null
}

interface VendorSettingsFormProps {
  vendor: SettingsVendor
}

const initialState: UpdateSettingsState = {}

export function VendorSettingsForm({ vendor }: VendorSettingsFormProps) {
  const router = useRouter()
  const [state, formAction, isSubmitting] = useActionState(updateVendorSettings, initialState)
  const [, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState(vendor.avatarUrl || '')
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showShopifyDomainModal, setShowShopifyDomainModal] = useState(false)
  const [shopifyDomain, setShopifyDomain] = useState(vendor.shopifyDomain || '')

  const getInitials = () => {
    const first = vendor.firstName?.[0] || ''
    const last = vendor.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'V'
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    )
  }

  const handlePauseAccount = () => {
    startTransition(async () => {
      await pauseAccount()
      router.refresh()
    })
  }

  const handleActivateAccount = () => {
    startTransition(async () => {
      await activateAccount()
      router.refresh()
    })
  }

  const handleDeleteAccount = async () => {
    await deleteVendorAccount()
  }

  const handleSaveShopifyDomain = async (domain: string) => {
    setShopifyDomain(domain)
    await updateShopifyDomain(domain)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-vintage-primary rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
              <p className="text-gray-600">Verwalten Sie Ihr Vendor-Profil und Store-Informationen</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Account Status</h3>
                <p className="text-gray-600">Mitglied seit {new Date(vendor.createdAt).toLocaleDateString('de-DE')}</p>
              </div>
              {getStatusBadge(vendor.status)}
            </div>

            {vendor.status === 'pending' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Ihr Account wird noch geprüft. Sie erhalten eine E-Mail, sobald Ihr Account genehmigt wurde.
                </p>
              </div>
            )}

            {vendor.status === 'approved' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  Ihr Account ist genehmigt! Sie können jetzt Produkte hinzufügen und verwalten.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form action={formAction} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Persönliche Informationen</h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Profilbild
                </label>
                <AvatarUpload
                  currentUrl={avatarUrl}
                  fallbackText={getInitials()}
                  onUploadComplete={(url) => setAvatarUrl(url)}
                  maxSize={2 * 1024 * 1024}
                />
                <input type="hidden" name="avatarUrl" value={avatarUrl} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="firstName"
                  label="Vorname"
                  placeholder="Ihr Vorname"
                  defaultValue={vendor.firstName}
                  error={state.errors?.firstName}
                  required
                />

                <Input
                  name="lastName"
                  label="Nachname"
                  placeholder="Ihr Nachname"
                  defaultValue={vendor.lastName}
                  error={state.errors?.lastName}
                  required
                />
              </div>

              <Input
                name="email"
                type="email"
                label="E-Mail Adresse"
                placeholder="ihre.email@example.com"
                defaultValue={vendor.email}
                error={state.errors?.email}
                hint="Diese E-Mail wird für wichtige Account-Benachrichtigungen verwendet"
                required
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Store className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Store Informationen</h3>
              </div>

              <Input
                name="storeName"
                label="Store Name"
                placeholder="Name Ihres Stores"
                defaultValue={vendor.storeName}
                error={state.errors?.storeName}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="storeWebsite"
                  label="Store Website"
                  placeholder="https://www.ihr-store.com"
                  defaultValue={vendor.storeWebsite || ''}
                  hint="Optional - Ihre Store-Website"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Standort
                  </label>
                  <select
                    name="storeLocation"
                    defaultValue={vendor.storeLocation || ''}
                    className="input-field"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="berlin">Berlin</option>
                    <option value="hamburg">Hamburg</option>
                    <option value="munich">München</option>
                    <option value="cologne">Köln</option>
                    <option value="frankfurt">Frankfurt</option>
                    <option value="stuttgart">Stuttgart</option>
                    <option value="düsseldorf">Düsseldorf</option>
                    <option value="dortmund">Dortmund</option>
                    <option value="essen">Essen</option>
                    <option value="leipzig">Leipzig</option>
                    <option value="bremen">Bremen</option>
                    <option value="dresden">Dresden</option>
                    <option value="hannover">Hannover</option>
                    <option value="nürnberg">Nürnberg</option>
                    <option value="other">Andere Stadt</option>
                  </select>
                </div>
              </div>
            </div>

            <div id="performance-goals" className="space-y-6 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Performance-Ziele</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  Legen Sie Ihre persönlichen Ziele fest. Diese werden in Ihrem Analytics-Dashboard zur Fortschrittsverfolgung verwendet.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="monthlyClickGoal"
                  type="number"
                  label="Monatliches Click-Ziel"
                  placeholder="2000"
                  defaultValue={vendor.monthlyClickGoal?.toString()}
                  error={state.errors?.monthlyClickGoal}
                  hint="Anzahl der Klicks, die Sie pro Monat erreichen möchten"
                  min="1"
                  required
                />

                <Input
                  name="ctrGoal"
                  type="number"
                  step="0.1"
                  label="CTR-Ziel (%)"
                  placeholder="5.0"
                  defaultValue={vendor.ctrGoal?.toString()}
                  error={state.errors?.ctrGoal}
                  hint="Ihre Ziel Click-Through-Rate in Prozent"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Commerce Platform
                  </label>
                  <select
                    name="ecommercePlatform"
                    defaultValue={vendor.ecommercePlatform || ''}
                    className="input-field"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="shopify">Shopify</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="magento">Magento</option>
                    <option value="prestashop">PrestaShop</option>
                    <option value="bigcommerce">BigCommerce</option>
                    <option value="squarespace">Squarespace</option>
                    <option value="wix">Wix</option>
                    <option value="custom">Eigene Lösung</option>
                    <option value="other">Andere</option>
                  </select>
                </div>

                <Input
                  name="inventorySystem"
                  label="Inventory Management System"
                  placeholder="z.B. Ihr Warenwirtschaftssystem"
                  defaultValue={vendor.inventorySystem || ''}
                  hint="Optional - Hilft bei der Integration"
                />
              </div>

              <Input
                name="numberOfItems"
                type="number"
                label="Anzahl der Artikel"
                placeholder="z.B. 400"
                defaultValue={vendor.numberOfItems?.toString() || ''}
                hint="Ungefähre Anzahl der Produkte in Ihrem Inventar"
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">E-Commerce Integration</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  Wichtig: Verwenden Sie Ihre Shopify Domain
                </p>
                <p className="text-blue-700 text-sm">
                  Für die Shopify App Integration benötigen Sie Ihre originale Shopify Domain (z.B. ihr-shop.myshopify.com oder ihr-shop.shopifypreview.com für Testzwecke).
                  Diese finden Sie in Ihrem Shopify Admin unter Einstellungen → Domains.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shopify-Domain
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      name="shopifyDomain"
                      placeholder="ihr-shop.myshopify.com"
                      value={shopifyDomain}
                      onChange={(e) => setShopifyDomain(e.target.value)}
                      error={state.errors?.shopifyDomain}
                      hint="Format: ihr-shop.myshopify.com (ohne https://)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowShopifyDomainModal(true)}
                  >
                    Bearbeiten
                  </Button>
                </div>
              </div>
            </div>

            {state.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium">{state.message}</p>
              </div>
            )}

            {state.errors?.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{state.errors.general}</p>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link href="/vendor/dashboard">
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </Link>

              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Wird gespeichert...' : 'Änderungen speichern'}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weitere Einstellungen</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Rechnungen & Zahlungen</h4>
                  <p className="text-sm text-blue-700">
                    Verwalten Sie Ihre Rechnungen, Zahlungshistorie und Zahlungsmethoden
                  </p>
                </div>
              </div>
              <Link href="/vendor/billing-portal">
                <Button variant="outline" size="sm" type="button">
                  Portal öffnen
                </Button>
              </Link>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              vendor.isActive
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div>
                <h4 className={`font-medium ${
                  vendor.isActive ? 'text-amber-900' : 'text-green-900'
                }`}>
                  {vendor.isActive ? 'Account pausieren' : 'Account aktivieren'}
                </h4>
                <p className={`text-sm ${
                  vendor.isActive ? 'text-amber-700' : 'text-green-700'
                }`}>
                  {vendor.isActive
                    ? 'Ihre Produkte werden temporär nicht mehr öffentlich angezeigt'
                    : 'Reaktivieren Sie Ihren Account und machen Sie Ihre Produkte wieder sichtbar'}
                </p>
                {!vendor.isActive && vendor.pausedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Pausiert seit {new Date(vendor.pausedAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              <Button
                variant={vendor.isActive ? 'outline' : 'primary'}
                size="sm"
                onClick={vendor.isActive ? handlePauseAccount : handleActivateAccount}
                type="button"
              >
                {vendor.isActive ? 'Pausieren' : 'Aktivieren'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-medium text-red-900">Account löschen</h4>
                <p className="text-sm text-red-700">Permanent Ihren Account und alle Daten löschen</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteAccountModal(true)}
                type="button"
              >
                Account löschen
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleDeleteAccount}
        vendorEmail={vendor.email}
      />

      <ShopifyDomainModal
        isOpen={showShopifyDomainModal}
        onClose={() => setShowShopifyDomainModal(false)}
        currentDomain={shopifyDomain}
        onSave={handleSaveShopifyDomain}
      />
    </>
  )
}
