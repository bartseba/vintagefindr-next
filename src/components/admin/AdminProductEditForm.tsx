'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import type { NavigationSection, DirectusBrand } from '@/lib/directus'
import { logoutAdmin } from '@/app/admin/dashboard/actions'
import { updateAdminProduct, type AdminProductEditState } from '@/app/admin/products/[id]/edit/actions'

export interface AdminEditProduct {
  id: string
  title: string
  brand: string | null
  category: string | null
  description: string | null
  price: number
  currency: string
  condition: string | null
  availability: string
  tags: string | null
  vintageStyles: string | null
  imageUrl1: string | null
  imageUrl2: string | null
  imageUrl3: string | null
  productUrl: string | null
  checkoutUrl: string | null
  isActive: boolean
  externalProductId: string
  externalVariantId: string | null
  vendorId: string
  vendorName: string
  clicks: number
  createdAt: string
  updatedAt: string
}

interface AdminProductEditFormProps {
  product: AdminEditProduct
  navigationSections: NavigationSection[]
  brands: DirectusBrand[]
}

const FALLBACK_CATEGORY_OPTIONS = [
  { value: 'pullis-hoodies', label: 'Pullis & Hoodies', group: 'HIGHLIGHTS' },
  { value: 'jacken', label: 'Jacken', group: 'OUTERWEAR' },
  { value: 'hosen', label: 'Hosen', group: 'HOSEN' },
]

const FALLBACK_BRAND_OPTIONS = [
  { value: 'Adidas', label: 'Adidas', group: 'Marken' },
  { value: 'Nike', label: 'Nike', group: 'Marken' },
  { value: 'Unbekannt', label: 'Unbekannt', group: 'Marken' },
]

const formatDateTime = (value: string) =>
  `${new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date(value).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`

const initialState: AdminProductEditState = {}

export function AdminProductEditForm({ product, navigationSections, brands }: AdminProductEditFormProps) {
  const updateWithId = updateAdminProduct.bind(null, product.id)
  // The Remix original never reads `useActionData()` either — a save-validation
  // error (e.g. "Titel ist erforderlich") returns from the action but is never
  // displayed anywhere; the form silently stays put. Preserved as-is, not
  // wired up to `state.error`, same class of gap as sub-phase 6.3's edit form.
  const [, formAction, isSubmitting] = useActionState(updateWithId, initialState)

  const [selectedBrand, setSelectedBrand] = useState(product.brand || '')
  const [selectedCategory, setSelectedCategory] = useState(product.category || '')

  const categoryOptions = useMemo(() => {
    if (navigationSections && navigationSections.length > 0) {
      return navigationSections.flatMap((section) =>
        (section.items || []).map((item) => {
          const slug = item.href?.split('/').pop() || item.label.toLowerCase()
          return { value: slug, label: item.label, group: section.label }
        })
      )
    }
    return FALLBACK_CATEGORY_OPTIONS
  }, [navigationSections])

  const brandOptions = useMemo(() => {
    if (brands && brands.length > 0) {
      return brands.map((brand) => ({ value: brand.Name, label: brand.Name, group: 'Marken' }))
    }
    return FALLBACK_BRAND_OPTIONS
  }, [brands])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/products"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>Zurück</span>
              </Link>
              <div className="border-l border-gray-300 h-6" />
              <h1 className="text-xl font-semibold text-gray-900">Produkt bearbeiten</h1>
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
        <form action={formAction} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basis-Informationen</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Titel <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      defaultValue={product.title}
                      className="w-full"
                    />
                  </div>

                  <SearchableSelect
                    name="brand"
                    label="Marke"
                    options={brandOptions}
                    value={selectedBrand}
                    onChange={setSelectedBrand}
                    placeholder="Marke suchen... (z.B. Adidas, Nike, Levi's)"
                  />

                  <SearchableSelect
                    name="category"
                    label="Kategorie"
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="Kategorie suchen..."
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Preis <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        defaultValue={product.price}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                        Währung <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        required
                        defaultValue={product.currency}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CHF">CHF (Fr)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Produkt-Details</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                      Zustand
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      defaultValue={product.condition || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Nicht angegeben</option>
                      <option value="Neu">Neu</option>
                      <option value="Sehr gut">Sehr gut</option>
                      <option value="Gut">Gut</option>
                      <option value="Akzeptabel">Akzeptabel</option>
                      <option value="Gebraucht">Gebraucht</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                      Verfügbarkeit
                    </label>
                    <select
                      id="availability"
                      name="availability"
                      defaultValue={product.availability}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="in stock">Auf Lager</option>
                      <option value="out of stock">Nicht auf Lager</option>
                      <option value="pre-order">Vorbestellung</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="vintageStyles" className="block text-sm font-medium text-gray-700 mb-1">
                      Vintage-Stile
                    </label>
                    <Input
                      id="vintageStyles"
                      name="vintageStyles"
                      type="text"
                      defaultValue={product.vintageStyles || ''}
                      placeholder="z.B. 80er, 90er, Y2K"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <Input
                      id="tags"
                      name="tags"
                      type="text"
                      defaultValue={product.tags || ''}
                      placeholder="Komma-getrennt"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Beschreibung</h2>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={product.description || ''}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Produktbeschreibung..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bilder</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="imageUrl1" className="block text-sm font-medium text-gray-700 mb-1">
                      Bild 1 URL
                    </label>
                    <Input
                      id="imageUrl1"
                      name="imageUrl1"
                      type="text"
                      defaultValue={product.imageUrl1 || ''}
                      placeholder="https://..."
                      className="w-full mb-2"
                    />
                    {product.imageUrl1 && (
                      // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches ProductGrid's existing plain-<img> approach
                      <img
                        src={`${product.imageUrl1}?class=thumbnail`}
                        alt="Preview 1"
                        className="w-24 h-24 object-cover rounded border border-gray-200"
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="imageUrl2" className="block text-sm font-medium text-gray-700 mb-1">
                      Bild 2 URL
                    </label>
                    <Input
                      id="imageUrl2"
                      name="imageUrl2"
                      type="text"
                      defaultValue={product.imageUrl2 || ''}
                      placeholder="https://..."
                      className="w-full mb-2"
                    />
                    {product.imageUrl2 && (
                      // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches ProductGrid's existing plain-<img> approach
                      <img
                        src={`${product.imageUrl2}?class=thumbnail`}
                        alt="Preview 2"
                        className="w-24 h-24 object-cover rounded border border-gray-200"
                      />
                    )}
                  </div>

                  <div>
                    <label htmlFor="imageUrl3" className="block text-sm font-medium text-gray-700 mb-1">
                      Bild 3 URL
                    </label>
                    <Input
                      id="imageUrl3"
                      name="imageUrl3"
                      type="text"
                      defaultValue={product.imageUrl3 || ''}
                      placeholder="https://..."
                      className="w-full mb-2"
                    />
                    {product.imageUrl3 && (
                      // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches ProductGrid's existing plain-<img> approach
                      <img
                        src={`${product.imageUrl3}?class=thumbnail`}
                        alt="Preview 3"
                        className="w-24 h-24 object-cover rounded border border-gray-200"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Links</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Produkt-URL
                    </label>
                    <Input
                      id="productUrl"
                      name="productUrl"
                      type="text"
                      defaultValue={product.productUrl || ''}
                      placeholder="https://..."
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkoutUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Checkout-URL
                    </label>
                    <Input
                      id="checkoutUrl"
                      name="checkoutUrl"
                      type="text"
                      defaultValue={product.checkoutUrl || ''}
                      placeholder="https://..."
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    defaultChecked={product.isActive}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Produkt ist aktiv
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadaten</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-900">Vendor:</span> {product.vendorName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Klicks:</span> {product.clicks}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Erstellt:</span>{' '}
                    {formatDateTime(product.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Aktualisiert:</span>{' '}
                    {formatDateTime(product.updatedAt)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">External ID:</span> {product.externalProductId}
                  </div>
                  {product.externalVariantId && (
                    <div>
                      <span className="font-medium text-gray-900">Variant ID:</span> {product.externalVariantId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Link href="/admin/products">
              <Button type="button" variant="outline">
                <X size={16} className="mr-2" />
                Abbrechen
              </Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              <Save size={16} className="mr-2" />
              Änderungen Speichern
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
