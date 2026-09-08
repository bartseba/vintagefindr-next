'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { logoutAdmin } from '@/app/admin/dashboard/actions'
import { deleteCollection, toggleCollection } from '@/app/admin/collections/actions'

export interface AdminCollectionListItem {
  id: string
  title: string
  subtitle: string | null
  slug: string
  isActive: boolean
  displayOrder: number
  itemCount: number
  createdAt: string
}

interface AdminCollectionsViewProps {
  collections: AdminCollectionListItem[]
}

export function AdminCollectionsView({ collections }: AdminCollectionsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = (collectionId: string) => {
    if (!confirm('Möchten Sie diese Collection wirklich löschen?')) return

    startTransition(async () => {
      await deleteCollection(collectionId)
      router.refresh()
    })
  }

  const handleToggle = (collectionId: string, isActive: boolean) => {
    startTransition(async () => {
      await toggleCollection(collectionId, isActive)
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
                href="/admin/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                <span>Collections Management</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/collections/new">
                <Button>
                  <Plus size={16} className="mr-2" />
                  Neue Collection
                </Button>
              </Link>

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-2">
            Verwalten Sie Produkt-Collections für die Startseite
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Noch keine Collections
            </h3>
            <p className="text-gray-600 mb-6">
              Erstellen Sie Ihre erste Collection um ausgewählte Produkte anzuzeigen
            </p>
            <Link href="/admin/collections/new">
              <Button>
                <Plus size={16} className="mr-2" />
                Neue Collection erstellen
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2 text-gray-400 cursor-move">
                      <GripVertical size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {collection.title}
                        </h3>
                        {!collection.isActive && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Inaktiv
                          </span>
                        )}
                      </div>

                      {collection.subtitle && (
                        <p className="text-gray-600 mb-2">{collection.subtitle}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Slug: <code className="bg-gray-100 px-2 py-0.5 rounded">{collection.slug}</code></span>
                        <span>•</span>
                        <span>{collection.itemCount} Produkte</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(collection.id, collection.isActive)}
                      disabled={isPending}
                    >
                      {collection.isActive ? (
                        <><Eye size={14} className="mr-1" /> Aktiv</>
                      ) : (
                        <><EyeOff size={14} className="mr-1" /> Inaktiv</>
                      )}
                    </Button>

                    <Link href={`/admin/collections/${collection.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit size={14} className="mr-1" />
                        Bearbeiten
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
