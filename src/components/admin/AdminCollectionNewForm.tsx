'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ImageUpload'
import { logoutAdmin } from '@/app/admin/dashboard/actions'
import { createCollection, type CreateCollectionState } from '@/app/admin/collections/new/actions'

const initialState: CreateCollectionState = {}

export function AdminCollectionNewForm() {
  const [state, formAction, isSubmitting] = useActionState(createCollection, initialState)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [image3, setImage3] = useState('')
  const [image4, setImage4] = useState('')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
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
                <span>Neue Collection</span>
              </Link>
            </div>

            <form action={logoutAdmin}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut size={16} className="mr-2" />
                Abmelden
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Neue Collection erstellen
          </h2>

          <form action={formAction} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <Input
                name="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="z.B. Graphic Sportswear"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Untertitel
              </label>
              <Input
                name="subtitle"
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
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Wird verwendet für: {'<Collection id="'}{slug}{'" />'}
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

            <div className="border-t pt-6 space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">
                  Alternative Bilder (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sie können bis zu 4 Bilder hochladen, die anstatt von Produkten angezeigt werden.
                </p>
              </div>

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

            {state.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {state.error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={!title || !slug || isSubmitting}
                className="flex-1"
              >
                <Save size={16} className="mr-2" />
                Collection erstellen
              </Button>
              <Link href="/admin/collections">
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
