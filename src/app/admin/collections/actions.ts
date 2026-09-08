'use server'

import { requireAdminAuth } from '@/lib/auth/session'

export interface CollectionActionResult {
  success?: boolean
  error?: string
}

export async function deleteCollection(collectionId: string): Promise<CollectionActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase.from('collections').delete().eq('id', collectionId)

  if (error) {
    console.error('Collection action error:', error)
    return { error: 'Action failed' }
  }

  return { success: true }
}

export async function toggleCollection(collectionId: string, isActive: boolean): Promise<CollectionActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('collections')
    .update({ is_active: !isActive, updated_at: new Date().toISOString() })
    .eq('id', collectionId)

  if (error) {
    console.error('Collection action error:', error)
    return { error: 'Action failed' }
  }

  return { success: true }
}
