import { notFound } from 'next/navigation'
import { requireAdminAuth } from '@/lib/auth/session'
import { AdminCollectionEditForm, type AdminEditCollection, type AdminCollectionItem } from '@/components/admin/AdminCollectionEditForm'

interface CollectionRow {
  id: string
  title: string
  subtitle: string | null
  slug: string
  is_active: boolean
  display_order: number
  collection_url: string | null
  image_1: string | null
  image_2: string | null
  image_3: string | null
  image_4: string | null
}

interface CollectionItemRow {
  id: string
  product_id: string
  display_order: number
  product: {
    id: string
    title: string
    brand: string
    price: number
    currency: string
    image_url_1: string
  } | null
}

export default async function AdminCollectionEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { supabase } = await requireAdminAuth()
  const { id: collectionId } = await params

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .single()

  if (!collection) {
    notFound()
  }

  const raw = collection as CollectionRow

  const { data: items } = await supabase
    .from('collection_items')
    .select(`
      *,
      product:products (
        id,
        title,
        brand,
        price,
        currency,
        image_url_1
      )
    `)
    .eq('collection_id', collectionId)
    .order('display_order', { ascending: true })

  const collectionData: AdminEditCollection = {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle,
    slug: raw.slug,
    isActive: raw.is_active,
    displayOrder: raw.display_order,
    collectionUrl: raw.collection_url,
    image1: raw.image_1,
    image2: raw.image_2,
    image3: raw.image_3,
    image4: raw.image_4,
  }

  const collectionItems: AdminCollectionItem[] = ((items || []) as unknown as CollectionItemRow[]).map((item) => ({
    id: item.id,
    productId: item.product_id,
    displayOrder: item.display_order,
    product: item.product,
  }))

  return <AdminCollectionEditForm collection={collectionData} items={collectionItems} />
}
