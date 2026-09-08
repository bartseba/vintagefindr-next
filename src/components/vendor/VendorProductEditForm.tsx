'use client'

import { useActionState, useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ImageUpload'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import type { NavigationSection, DirectusBrand, DirectusSize } from '@/lib/directus'
import { updateProduct, type UpdateProductState } from '@/app/vendor/products/[id]/edit/actions'

interface SelectOption {
  value: string
  label: string
  group: string
}

export interface EditableProduct {
  id: string
  title: string
  description: string | null
  brand: string | null
  category: string | null
  era: string | null
  price: number | null
  condition: string | null
  availability: string | null
  stock_qty: number | null
  shipping_cost: number | null
  free_shipping_threshold: number | null
  delivery_time_min_days: number | null
  delivery_time_max_days: number | null
  tax_included: boolean | null
  image_url_1: string | null
  image_url_2: string | null
  image_url_3: string | null
  product_url: string | null
  checkout_url: string | null
  tags: string | null
  external_product_id: string | null
  size: string | null
}

interface VendorProductEditFormProps {
  product: EditableProduct
  navigationSections: NavigationSection[]
  sizes: DirectusSize[]
  brands: DirectusBrand[]
}

const FALLBACK_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'pullis-hoodies', label: 'Pullis & Hoodies', group: 'HIGHLIGHTS' },
  { value: 'jacken', label: 'Jacken', group: 'OUTERWEAR' },
  { value: 'hosen', label: 'Hosen', group: 'HOSEN' },
]

const FALLBACK_SIZE_OPTIONS: SelectOption[] = [
  { value: 'XS', label: 'XS', group: 'Standard' },
  { value: 'S', label: 'S', group: 'Standard' },
  { value: 'M', label: 'M', group: 'Standard' },
  { value: 'L', label: 'L', group: 'Standard' },
  { value: 'XL', label: 'XL', group: 'Standard' },
  { value: 'One Size', label: 'One Size', group: 'Standard' },
]

const FALLBACK_BRAND_OPTIONS: SelectOption[] = [
  { value: 'Adidas', label: 'Adidas', group: 'Marken' },
  { value: 'Nike', label: 'Nike', group: 'Marken' },
  { value: 'Unbekannt', label: 'Unbekannt', group: 'Marken' },
]

const initialState: UpdateProductState = {}

export function VendorProductEditForm({ product, navigationSections, sizes, brands }: VendorProductEditFormProps) {
  const updateProductWithId = updateProduct.bind(null, product.id)
  const [state, formAction, isSubmitting] = useActionState(updateProductWithId, initialState)

  const [imageUrls, setImageUrls] = useState({
    image1: product.image_url_1 || '',
    image2: product.image_url_2 || '',
    image3: product.image_url_3 || '',
  })
  const [selectedBrand, setSelectedBrand] = useState(product.brand || '')
  const [selectedCategory, setSelectedCategory] = useState(product.category || '')
  const [selectedSize, setSelectedSize] = useState(product.size || '')

  const handleImageChange = useCallback((field: 'image1' | 'image2' | 'image3', url: string) => {
    setImageUrls(prev => ({ ...prev, [field]: url }))
  }, [])

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

  const sizeOptions = useMemo(() => {
    if (!sizes || sizes.length === 0) return FALLBACK_SIZE_OPTIONS

    const options: SelectOption[] = []
    const parentMap = new Map<number, DirectusSize>()
    sizes.forEach((s) => {
      if (!s.parent) parentMap.set(s.id, s)
    })
    sizes.forEach((size) => {
      if (size.parent) {
        const parent = parentMap.get(size.parent)
        options.push({ value: size.Name, label: size.Name, group: parent?.Name || 'Andere' })
      } else {
        const hasChildren = sizes.some((s) => s.parent === size.id)
        if (!hasChildren) {
          options.push({ value: size.Name, label: size.Name, group: 'Standard' })
        }
      }
    })
    return options
  }, [sizes])

  const brandOptions = useMemo(() => {
    if (brands && brands.length > 0) {
      return brands.map((brand) => ({ value: brand.Name, label: brand.Name, group: 'Marken' }))
    }
    return FALLBACK_BRAND_OPTIONS
  }, [brands])

  return (
    <>
      <div className="min-h-screen bg-white">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/vendor/products"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                  <span>Produkt bearbeiten</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Produkt bearbeiten
              </h1>
              <p className="text-gray-600">
                Bearbeiten Sie die Details Ihres Vintage-Produkts
              </p>
            </div>

            <form action={formAction} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Grundinformationen</h3>

                <Input
                  name="title"
                  label="Titel"
                  placeholder="z.B. Vintage Sommerkleid 70er Jahre"
                  defaultValue={product.title}
                  error={state.errors?.title}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibung *
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className="input-field"
                    placeholder="Detaillierte Beschreibung des Produkts..."
                    defaultValue={product.description || ''}
                    required
                  />
                  {state.errors?.description && (
                    <p className="text-xs text-red-600 mt-1">{state.errors.description}</p>
                  )}
                </div>

                <SearchableSelect
                  name="brand"
                  label="Marke"
                  options={brandOptions}
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  placeholder="Marke suchen... (z.B. Adidas, Nike, Levi's)"
                  required
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Preis & Zustand</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    label="Preis (in Euro)"
                    placeholder="45.00"
                    defaultValue={product.price?.toString() || ''}
                    error={state.errors?.price}
                    hint="Preis ohne Währungszeichen"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zustand
                    </label>
                    <select name="condition" className="input-field" defaultValue={product.condition || ''}>
                      <option value="">Bitte wählen</option>
                      <option value="neu">Neu</option>
                      <option value="sehr gut">Sehr gut</option>
                      <option value="gut">Gut</option>
                      <option value="akzeptabel">Akzeptabel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verfügbarkeit
                    </label>
                    <select name="availability" className="input-field" defaultValue={product.availability || 'in_stock'}>
                      <option value="in_stock">Auf Lager</option>
                      <option value="out_of_stock">Ausverkauft</option>
                      <option value="preorder">Vorbestellung</option>
                      <option value="discontinued">Eingestellt</option>
                    </select>
                  </div>

                  <Input
                    name="stockQty"
                    type="number"
                    label="Lagerbestand"
                    placeholder="1"
                    defaultValue={product.stock_qty?.toString() || ''}
                    hint="Anzahl verfügbarer Stücke"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Währung:</span>
                    <span className="text-sm text-gray-900 bg-white px-2 py-1 rounded border">EUR (Euro)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Alle Preise werden automatisch in Euro gespeichert
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Versand & Lieferung (optional)</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Angaben gemäß Preisangabenverordnung. Wenn Sie diese Felder nicht ausfüllen,
                    wird ein Standard-Hinweis angezeigt, dass Versandkosten beim Händler variieren.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="shippingCost"
                    type="number"
                    step="0.01"
                    label="Versandkosten (in Euro)"
                    placeholder="4.99"
                    defaultValue={product.shipping_cost?.toString() || ''}
                    hint="Leer lassen für Standard-Hinweis"
                  />

                  <Input
                    name="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    label="Versandkostenfrei ab (in Euro)"
                    placeholder="50.00"
                    defaultValue={product.free_shipping_threshold?.toString() || ''}
                    hint="Optional: Ab welchem Betrag versandkostenfrei"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="deliveryTimeMinDays"
                    type="number"
                    label="Lieferzeit Min (Werktage)"
                    placeholder="2"
                    defaultValue={product.delivery_time_min_days?.toString() || ''}
                    hint="Minimale Lieferzeit in Werktagen"
                  />

                  <Input
                    name="deliveryTimeMaxDays"
                    type="number"
                    label="Lieferzeit Max (Werktage)"
                    placeholder="5"
                    defaultValue={product.delivery_time_max_days?.toString() || ''}
                    hint="Maximale Lieferzeit in Werktagen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mehrwertsteuer
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="taxIncluded"
                        value="true"
                        defaultChecked={product.tax_included !== false}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Preis inkl. MwSt.</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="taxIncluded"
                        value="false"
                        defaultChecked={product.tax_included === false}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Ohne MwSt. (Kleinunternehmer §19 UStG)</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Standard ist &quot;inkl. MwSt.&quot; - nur bei Kleinunternehmerregelung abwählen
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Kategorie</h3>

                <SearchableSelect
                  name="category"
                  label="Kategorie"
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Kategorie suchen..."
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vintage Style (optional)
                  </label>
                  <select name="vintageStyle" className="input-field" defaultValue={product.era || ''}>
                    <option value="">Bitte wählen</option>
                    <option value="Luxury Vintage">Luxury Vintage</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Sportswear">Sportswear</option>
                    <option value="Y2K">Y2K</option>
                    <option value="90s">90s</option>
                    <option value="80s">80s</option>
                    <option value="Workwear">Workwear</option>
                    <option value="Punk">Punk</option>
                    <option value="Glam">Glam</option>
                    <option value="Western">Western</option>
                    <option value="Retro Denim">Retro Denim</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Wählen Sie den passenden Vintage-Stil für bessere Kategorisierung
                  </p>
                </div>

                <SearchableSelect
                  name="size"
                  label="Größe"
                  options={sizeOptions}
                  value={selectedSize}
                  onChange={setSelectedSize}
                  placeholder="Größe suchen..."
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Produktbilder</h3>

                <div className="grid grid-cols-1 gap-6">
                  <ImageUpload
                    name="imageUrl1"
                    label="Hauptbild"
                    value={imageUrls.image1}
                    onChange={(url) => handleImageChange('image1', url)}
                    hint="Das Hauptbild Ihres Produkts (wird in Suchergebnissen angezeigt)"
                  />

                  <ImageUpload
                    name="imageUrl2"
                    label="Zusätzliches Bild 1"
                    value={imageUrls.image2}
                    onChange={(url) => handleImageChange('image2', url)}
                    hint="Zusätzliche Ansicht des Produkts (optional)"
                  />

                  <ImageUpload
                    name="imageUrl3"
                    label="Zusätzliches Bild 2"
                    value={imageUrls.image3}
                    onChange={(url) => handleImageChange('image3', url)}
                    hint="Weitere Ansicht des Produkts (optional)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Links</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    name="productUrl"
                    label="Produkt-URL"
                    placeholder="https://ihr-shop.com/produkt/123"
                    defaultValue={product.product_url || ''}
                    error={state.errors?.productUrl}
                    hint="Link zur Produktseite in Ihrem Shop"
                    required
                  />

                  <Input
                    name="checkoutUrl"
                    label="Checkout-URL"
                    placeholder="https://ihr-shop.com/checkout/123"
                    defaultValue={product.checkout_url || ''}
                    hint="Direkter Link zum Kaufen (optional)"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <Input
                  name="tags"
                  label="Tags"
                  placeholder="vintage, sommer, elegant, party"
                  defaultValue={product.tags || ''}
                  hint="Schlagwörter kommagetrennt für bessere Auffindbarkeit"
                />

                <Input
                  name="externalProductId"
                  label="Externe Produkt-ID"
                  placeholder="z.B. PROD-001"
                  defaultValue={product.external_product_id || ''}
                  error={state.errors?.externalProductId}
                  hint="Ihre interne Produkt-ID (optional)"
                />
              </div>

              {state.errors?.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{state.errors.general}</p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/vendor/products">
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
        </div>
      </div>
    </>
  )
}
