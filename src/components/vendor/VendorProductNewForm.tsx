'use client'

import { useActionState, useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ImageUpload'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import type { ProductFormNavigationItem, DirectusBrand, DirectusSize } from '@/lib/directus'
import { createProduct, type CreateProductState } from '@/app/vendor/products/new/actions'

interface SelectOption {
  value: string
  label: string
  group: string
}

interface VendorProductNewFormProps {
  navigationItems: ProductFormNavigationItem[]
  sizes: DirectusSize[]
  brands: DirectusBrand[]
}

const FALLBACK_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'pullis-hoodies', label: 'Pullis & Hoodies', group: 'HIGHLIGHTS' },
  { value: 'trainingsjacken', label: 'Trainingsjacken', group: 'HIGHLIGHTS' },
  { value: 'hemden', label: 'Hemden', group: 'HIGHLIGHTS' },
  { value: 't-shirts', label: 'T-Shirts', group: 'HIGHLIGHTS' },
  { value: 'polos', label: 'Polos', group: 'HIGHLIGHTS' },
  { value: 'jeans', label: 'Jeans', group: 'HIGHLIGHTS' },
  { value: 'reworks', label: 'Reworks', group: 'HIGHLIGHTS' },
  { value: 'accessoires', label: 'Accessoires', group: 'HIGHLIGHTS' },
  { value: 'sweater-hoodies', label: 'Sweater & Hoodies', group: 'OBERTEILE' },
  { value: 'knitwear', label: 'Knitwear', group: 'OBERTEILE' },
  { value: 'trikots-jerseys', label: 'Trikots & Jerseys', group: 'OBERTEILE' },
  { value: 'blazer', label: 'Blazer', group: 'OBERTEILE' },
  { value: 'jacken', label: 'Jacken', group: 'OUTERWEAR' },
  { value: 'fleece-jacken', label: 'Fleece Jacken', group: 'OUTERWEAR' },
  { value: 'leichte-jacken', label: 'Leichte Jacken', group: 'OUTERWEAR' },
  { value: 'dickere-jacken', label: 'Dickere Jacken', group: 'OUTERWEAR' },
  { value: 'lederjacken', label: 'Lederjacken', group: 'OUTERWEAR' },
  { value: 'westen', label: 'Westen', group: 'OUTERWEAR' },
  { value: 'schals', label: 'Schals', group: 'OUTERWEAR' },
  { value: 'hosen', label: 'Hosen', group: 'HOSEN' },
  { value: 'cord-chinos', label: 'Cord & Chinos', group: 'HOSEN' },
  { value: 'track-pants', label: 'Track Pants', group: 'HOSEN' },
  { value: 'shorts', label: 'Shorts', group: 'HOSEN' },
]

const FALLBACK_SIZE_OPTIONS: SelectOption[] = [
  { value: 'XS', label: 'XS', group: 'Standard' },
  { value: 'S', label: 'S', group: 'Standard' },
  { value: 'M', label: 'M', group: 'Standard' },
  { value: 'L', label: 'L', group: 'Standard' },
  { value: 'XL', label: 'XL', group: 'Standard' },
  { value: 'XXL', label: 'XXL', group: 'Standard' },
  { value: 'EU 38', label: 'EU 38', group: 'EU Größen' },
  { value: 'EU 40', label: 'EU 40', group: 'EU Größen' },
  { value: 'EU 42', label: 'EU 42', group: 'EU Größen' },
  { value: 'One Size', label: 'One Size', group: 'Standard' },
]

const FALLBACK_BRAND_OPTIONS: SelectOption[] = [
  { value: 'Adidas', label: 'Adidas', group: 'Marken' },
  { value: 'Nike', label: 'Nike', group: 'Marken' },
  { value: "Levi's", label: "Levi's", group: 'Marken' },
  { value: 'Carhartt', label: 'Carhartt', group: 'Marken' },
  { value: 'The North Face', label: 'The North Face', group: 'Marken' },
  { value: 'Patagonia', label: 'Patagonia', group: 'Marken' },
  { value: 'Champion', label: 'Champion', group: 'Marken' },
  { value: 'Tommy Hilfiger', label: 'Tommy Hilfiger', group: 'Marken' },
  { value: 'Calvin Klein', label: 'Calvin Klein', group: 'Marken' },
  { value: 'Ralph Lauren', label: 'Ralph Lauren', group: 'Marken' },
  { value: 'Vintage Original', label: 'Vintage Original', group: 'Marken' },
  { value: 'No Brand', label: 'No Brand', group: 'Marken' },
  { value: 'Unbekannt', label: 'Unbekannt', group: 'Marken' },
  { value: 'Andere', label: 'Andere', group: 'Marken' },
]

const initialState: CreateProductState = {}

export function VendorProductNewForm({ navigationItems, sizes, brands }: VendorProductNewFormProps) {
  const [state, formAction, isSubmitting] = useActionState(createProduct, initialState)

  const [imageUrls, setImageUrls] = useState({ image1: '', image2: '', image3: '' })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [suggestions, setSuggestions] = useState<{ brand?: string; category?: string; size?: string }>({})

  const handleImageChange = useCallback((field: 'image1' | 'image2' | 'image3', url: string) => {
    setImageUrls(prev => ({ ...prev, [field]: url }))
  }, [])

  const handleSuggestion = useCallback(async (type: 'brand' | 'category' | 'size', value: string) => {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value }),
      })

      const result = await response.json()

      if (result.success) {
        setSuggestions(prev => ({ ...prev, [type]: value }))

        if (type === 'brand') setSelectedBrand(value)
        if (type === 'category') setSelectedCategory(value)
        if (type === 'size') setSelectedSize(value)

        alert(`"${value}" wurde als ${type === 'brand' ? 'Marke' : type === 'category' ? 'Kategorie' : 'Größe'} vorgeschlagen und wird nach Freigabe verfügbar sein.`)
      }
    } catch (error) {
      console.error('Suggestion error:', error)
      alert('Fehler beim Erstellen des Vorschlags')
    }
  }, [])

  const categoryOptions = useMemo(() => {
    if (navigationItems && navigationItems.length > 0) {
      const options: SelectOption[] = []

      navigationItems.forEach((item) => {
        const slug = item.href?.split('/').pop() || item.label.toLowerCase()
        options.push({ value: slug, label: item.label, group: 'Kategorien' })

        item.children?.forEach((child) => {
          const childSlug = child.href?.split('/').pop() || child.label.toLowerCase()
          options.push({ value: childSlug, label: child.label, group: item.label })
        })
      })

      return options
    }

    return FALLBACK_CATEGORY_OPTIONS
  }, [navigationItems])

  const sizeOptions = useMemo(() => {
    if (!sizes || sizes.length === 0) return FALLBACK_SIZE_OPTIONS

    const options: SelectOption[] = []
    const parentMap = new Map<number, DirectusSize>()
    sizes.forEach((s) => {
      if (!s.parent) {
        parentMap.set(s.id, s)
      }
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

  const baseBrandOptions = useMemo(() => {
    if (brands && brands.length > 0) {
      return brands.map((brand) => ({ value: brand.Name, label: brand.Name, group: 'Marken' }))
    }
    return FALLBACK_BRAND_OPTIONS
  }, [brands])

  const brandOptions = useMemo(() => {
    const options = [...baseBrandOptions]
    if (suggestions.brand && !options.find(o => o.value === suggestions.brand)) {
      options.push({ value: suggestions.brand, label: `${suggestions.brand} (Vorgeschlagen - wartet auf Freigabe)`, group: 'Vorgeschlagen' })
    }
    return options
  }, [baseBrandOptions, suggestions.brand])

  const finalCategoryOptions = useMemo(() => {
    const options = [...categoryOptions]
    if (suggestions.category && !options.find(o => o.value === suggestions.category)) {
      options.push({ value: suggestions.category, label: `${suggestions.category} (Vorgeschlagen - wartet auf Freigabe)`, group: 'Vorgeschlagen' })
    }
    return options
  }, [categoryOptions, suggestions.category])

  const finalSizeOptions = useMemo(() => {
    const options = [...sizeOptions]
    if (suggestions.size && !options.find(o => o.value === suggestions.size)) {
      options.push({ value: suggestions.size, label: `${suggestions.size} (Vorgeschlagen - wartet auf Freigabe)`, group: 'Vorgeschlagen' })
    }
    return options
  }, [sizeOptions, suggestions.size])

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Neues Produkt hinzufügen
            </h1>
            <p className="text-gray-600">
              Fügen Sie ein neues Vintage-Produkt zu Ihrem Store hinzu
            </p>
          </div>

          <form action={formAction} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Grundinformationen</h3>

              <Input
                name="title"
                label="Titel *"
                placeholder="z.B. Vintage Sommerkleid 70er Jahre"
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
                error={state.errors?.brand}
                onSuggest={(value) => handleSuggestion('brand', value)}
                suggestType="brand"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Preis & Zustand</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  label="Preis (in Euro)*"
                  placeholder="45.00"
                  error={state.errors?.price}
                  hint="Preis ohne Währungszeichen"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zustand
                  </label>
                  <select name="condition" className="input-field">
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
                  <select name="availability" className="input-field">
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
                  defaultValue="1"
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
                  hint="Leer lassen für Standard-Hinweis"
                />

                <Input
                  name="freeShippingThreshold"
                  type="number"
                  step="0.01"
                  label="Versandkostenfrei ab (in Euro)"
                  placeholder="50.00"
                  hint="Optional: Ab welchem Betrag versandkostenfrei"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="deliveryTimeMinDays"
                  type="number"
                  label="Lieferzeit Min (Werktage)"
                  placeholder="2"
                  hint="Minimale Lieferzeit in Werktagen"
                />

                <Input
                  name="deliveryTimeMaxDays"
                  type="number"
                  label="Lieferzeit Max (Werktage)"
                  placeholder="5"
                  hint="Maximale Lieferzeit in Werktagen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mehrwertsteuer
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="taxIncluded" value="true" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Preis inkl. MwSt.</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="taxIncluded" value="false" className="mr-2" />
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
                options={finalCategoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Kategorie suchen... (z.B. hosen, jacken, shirts)"
                required
                error={state.errors?.category}
                onSuggest={(value) => handleSuggestion('category', value)}
                suggestType="category"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vintage Style (optional)
                </label>
                <select name="vintageStyle" className="input-field">
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
                options={finalSizeOptions}
                value={selectedSize}
                onChange={setSelectedSize}
                placeholder="Größe suchen... (z.B. 42, M, L)"
                required
                error={state.errors?.size}
                onSuggest={(value) => handleSuggestion('size', value)}
                suggestType="size"
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
                  required
                  error={state.errors?.imageUrl1}
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs">💡</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Tipps für bessere Produktbilder</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Verwenden Sie helle, natürliche Beleuchtung</li>
                      <li>• Zeigen Sie das Produkt aus verschiedenen Winkeln</li>
                      <li>• Achten Sie auf einen sauberen, neutralen Hintergrund</li>
                      <li>• Bilder werden automatisch optimiert und über CDN bereitgestellt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Links</h3>
              <Input
                name="productUrl"
                label="Produkt-URL *"
                placeholder="https://ihr-shop.com/produkt/123"
                error={state.errors?.productUrl}
                hint="Link zur Produktseite in Ihrem Shop"
                required
              />
            </div>

            <div className="space-y-6">
              <Input
                name="tags"
                label="Tags"
                placeholder="vintage, sommer, elegant, party"
                hint="Schlagwörter kommagetrennt für bessere Auffindbarkeit"
              />

              <Input
                name="externalProductId"
                label="Externe Produkt-ID"
                placeholder="z.B. PROD-001"
                error={state.errors?.externalProductId}
                hint="Ihre interne Produkt-ID (optional)"
              />
            </div>

            {state.errors?.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{state.errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Veröffentlichung</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="publishNow"
                    className="mt-1 h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-gray-900">
                      Produkt sofort veröffentlichen
                    </span>
                    <span className="block text-xs text-gray-600 mt-1">
                      Wenn diese Option nicht aktiviert ist, wird das Produkt als Entwurf gespeichert und ist nicht öffentlich sichtbar. Sie können es später in der Produktliste veröffentlichen.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Link href="/vendor/products">
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </Link>

              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Wird gespeichert...' : 'Produkt erstellen'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
