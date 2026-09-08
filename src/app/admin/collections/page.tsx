import { requireAdminAuth } from '@/lib/auth/session'
import { AdminCollectionsView, type AdminCollectionListItem } from '@/components/admin/AdminCollectionsView'

interface CollectionRow {
  id: string
  title: string
  subtitle: string | null
  slug: string
  is_active: boolean
  display_order: number
  created_at: string
  collection_items: Array<{ count: number }> | null
}

export default async function AdminCollectionsPage() {
  const { supabase } = await requireAdminAuth()

  let collections: AdminCollectionListItem[] = []

  try {
    const { data: collectionsData } = await supabase
      .from('collections')
      .select(`
        *,
        collection_items (count)
      `)
      .order('display_order', { ascending: true })

    if (collectionsData) {
      collections = (collectionsData as unknown as CollectionRow[]).map((c) => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle,
        slug: c.slug,
        isActive: c.is_active,
        displayOrder: c.display_order,
        itemCount: c.collection_items?.[0]?.count || 0,
        createdAt: c.created_at,
      }))
    }
  } catch (error) {
    console.error('Collections loading error:', error)
  }

  return <AdminCollectionsView collections={collections} />
}
