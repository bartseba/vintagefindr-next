'use server'

import { redirect } from 'next/navigation'
import { requireAdminAuth } from '@/lib/auth/session'

export interface CreateCollectionState {
  error?: string
}

export async function createCollection(_prevState: CreateCollectionState, formData: FormData): Promise<CreateCollectionState> {
  const { supabase } = await requireAdminAuth()

  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string
  const slug = formData.get('slug') as string
  const isActive = formData.get('isActive') === 'true'
  const image1 = formData.get('image1') as string
  const image2 = formData.get('image2') as string
  const image3 = formData.get('image3') as string
  const image4 = formData.get('image4') as string

  if (!title || !slug) {
    return { error: 'Invalid data' }
  }

  let newCollectionId: string

  try {
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCollection) {
      return { error: 'Slug bereits vergeben' }
    }

    const { data: collections } = await supabase
      .from('collections')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = collections && collections.length > 0
      ? collections[0].display_order + 1
      : 0

    const { data: newCollection, error } = await supabase
      .from('collections')
      .insert({
        title,
        subtitle: subtitle || null,
        slug,
        is_active: isActive,
        display_order: nextOrder,
        image_1: image1 || null,
        image_2: image2 || null,
        image_3: image3 || null,
        image_4: image4 || null,
      })
      .select()
      .single()

    if (error) throw error

    newCollectionId = newCollection.id
  } catch (error) {
    console.error('Collection creation error:', error)
    return { error: 'Erstellung fehlgeschlagen' }
  }

  redirect(`/admin/collections/${newCollectionId}/edit`)
}
