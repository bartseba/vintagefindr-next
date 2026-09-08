'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Search, X, Plus, GripVertical, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ImageUpload'
import { logoutAdmin } from '@/app/admin/dashboard/actions'
import {
  updateCollectionSettings,
  addProductToCollection,
  removeProductFromCollection,
  type CollectionEditState,
} from '@/app/admin/collections/[id]/edit/actions'

export interface AdminEditCollection {
  id: string
  title: string
  subtitle: string | null
  slug: string
  isActive: boolean
  displayOrder: number
  collectionUrl: string | null
  image1: string | null
  image2: string | null
  image3: string | null
  image4: string | null
}

export interface AdminCollectionItem {
  id: string
  productId: string
  displayOrder: number
  product: {
    id: string
    title: string
    brand: string
    price: number
    currency: string
    image_url_1: string
  } | null
}

interface SearchProduct {
  id: string
  title: string
  brand: string
  price: number
  currency: string
  image_url_1: string
}

interface AdminCollectionEditFormProps {
  collection: AdminEditCollection
  items: AdminCollectionItem[]
}

const initialState: CollectionEditState = {}
const FORM_ID = 'collection-edit-form'

export function AdminCollectionEditForm({ collection, items }: AdminCollectionEditFormProps) {
  const router = useRouter()
  const updateWithId = updateCollectionSettings.bind(null, collection.id)
  const [, formAction, isSubmitting] = useActionState(updateWithId, initialState)
  const [isPending, startTransition] = useTransition()

  const [slug, setSlug] = useState(collection.slug)
  const [isActive, setIsActive] = useState(collection.isActive)
  const [image1, setImage1] = useState(collection.image1 || '')
  const [image2, setImage2] = useState(collection.image2 || '')
  const [image3, setImage3] = useState(collection.image3 || '')
  const [image4, setImage4] = useState(collection.image4 || '')
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/admin/collections/search-products?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.error) {
        console.error('Search API error:', data.error)
      }

      setSearchResults(data.products || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddProduct = (productId: string) => {
    startTransition(async () => {
      await addProductToCollection(collection.id, productId)
      router.refresh()
    })
    setShowProductSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveProduct = (itemId: string) => {
    if (!confirm('Produkt aus der Collection entfernen?')) return

    startTransition(async () => {
      await removeProductFromCollection(itemId)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/collections"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>Collection bearbeiten</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" form={FORM_ID} isLoading={isSubmitting}>
                <Save size={16} className="mr-2" />
                Speichern
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form id={FORM_ID} action={formAction} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Collection Einstellungen
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titel *
                  </label>
                  <Input
                    name="title"
                    defaultValue={collection.title}
                    placeholder="z.B. Graphic Sportswear"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Untertitel
                  </label>
                  <Input
                    name="subtitle"
                    defaultValue={collection.subtitle || ''}
                    placeholder="z.B. VINTAGE, STARTER, NUTMEG +MORE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL) *
                  </label>
                  <Input
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="graphic-sportswear"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Wird verwendet für: {'<Collection id="'}{slug}{'" />'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection URL
                  </label>
                  <Input
                    name="collectionUrl"
                    defaultValue={collection.collectionUrl || ''}
                    placeholder="/vintage?collection=graphic-sportswear oder https://..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Link der beim Hover über die Collection angezeigt wird
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <input type="hidden" name="isActive" value={String(isActive)} />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Collection ist aktiv (sichtbar auf der Seite)
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Alternative Bilder
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Anstatt Produkte können Sie auch bis zu 4 Bilder für die Collection hochladen.
              </p>

              <div className="space-y-4">
                <ImageUpload
                  name="image1"
                  label="Bild 1"
                  value={image1}
                  onChange={setImage1}
                  hint="Empfohlen: 400x500px"
                />

                <ImageUpload
                  name="image2"
                  label="Bild 2"
                  value={image2}
                  onChange={setImage2}
                  hint="Empfohlen: 400x500px"
                />

                <ImageUpload
                  name="image3"
                  label="Bild 3"
                  value={image3}
                  onChange={setImage3}
                  hint="Empfohlen: 400x500px"
                />

                <ImageUpload
                  name="image4"
                  label="Bild 4"
                  value={image4}
                  onChange={setImage4}
                  hint="Empfohlen: 400x500px"
                />
              </div>
            </div>
          </form>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Produkte ({items.length})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSearch(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Produkt hinzufügen
                </Button>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Noch keine Produkte</p>
                    <p className="text-sm mt-1">Klicken Sie auf &quot;Produkt hinzufügen&quot;</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <GripVertical size={16} className="text-gray-400 cursor-move" />

                      {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches ProductGrid's existing plain-<img> approach */}
                      <img
                        src={item.product?.image_url_1}
                        alt={item.product?.title}
                        className="w-16 h-16 object-cover rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.product?.brand} • {item.product?.currency === 'EUR' ? '€' : item.product?.currency} {item.product?.price}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveProduct(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        disabled={isPending}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProductSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Produkt hinzufügen</h2>
              <button
                onClick={() => {
                  setShowProductSearch(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 border-b">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Produkt suchen (Titel, Marke, ID...)"
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching}>
                  Suchen
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {searching ? (
                <div className="text-center py-12 text-gray-500">
                  Suche läuft...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? 'Keine Produkte gefunden' : 'Geben Sie einen Suchbegriff ein'}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((product) => {
                    const alreadyAdded = items.some((item) => item.productId === product.id)

                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied remote CDN image, matches ProductGrid's existing plain-<img> approach */}
                        <img
                          src={product.image_url_1}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {product.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.brand} • {product.currency === 'EUR' ? '€' : product.currency} {product.price}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleAddProduct(product.id)}
                          disabled={alreadyAdded || isPending}
                        >
                          {alreadyAdded ? 'Bereits hinzugefügt' : 'Hinzufügen'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
