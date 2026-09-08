'use server'

import { requireAdminAuth } from '@/lib/auth/session'

export interface CollectionEditState {
  error?: string
  success?: boolean
}

export async function updateCollectionSettings(collectionId: string, _prevState: CollectionEditState, formData: FormData): Promise<CollectionEditState> {
  const { supabase } = await requireAdminAuth()

  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string
  const slug = formData.get('slug') as string
  const isActive = formData.get('isActive') === 'true'
  const collectionUrl = formData.get('collectionUrl') as string
  const image1 = formData.get('image1') as string
  const image2 = formData.get('image2') as string
  const image3 = formData.get('image3') as string
  const image4 = formData.get('image4') as string

  const { error } = await supabase
    .from('collections')
    .update({
      title,
      subtitle: subtitle || null,
      slug,
      is_active: isActive,
      collection_url: collectionUrl || null,
      image_1: image1 || null,
      image_2: image2 || null,
      image_3: image3 || null,
      image_4: image4 || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', collectionId)

  if (error) {
    console.error('Collection action error:', error)
    return { error: 'Action failed' }
  }

  return { success: true }
}

export interface CollectionItemActionResult {
  success?: boolean
  error?: string
}

export async function addProductToCollection(collectionId: string, productId: string): Promise<CollectionItemActionResult> {
  const { supabase } = await requireAdminAuth()

  const { data: existingItems } = await supabase
    .from('collection_items')
    .select('display_order')
    .eq('collection_id', collectionId)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existingItems && existingItems.length > 0
    ? existingItems[0].display_order + 1
    : 0

  const { error } = await supabase
    .from('collection_items')
    .insert({ collection_id: collectionId, product_id: productId, display_order: nextOrder })

  if (error) {
    console.error('Collection action error:', error)
    return { error: 'Action failed' }
  }

  return { success: true }
}

export async function removeProductFromCollection(itemId: string): Promise<CollectionItemActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase.from('collection_items').delete().eq('id', itemId)

  if (error) {
    console.error('Collection action error:', error)
    return { error: 'Action failed' }
  }

  return { success: true }
}
