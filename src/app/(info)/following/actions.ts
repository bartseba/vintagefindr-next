'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Ported from `_info.following.tsx`'s `action` (`_action=unfollow`) — the
 * one real, reachable action in this migration's "following" scope (unlike
 * `dashboard.tsx`'s logout action or `_info.favorites.tsx`'s remove action,
 * both dead code in the original — see those routes' notes).
 */
export async function unfollowVendor(followId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (!authUser || authError) {
    return { error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('id', followId)
      .eq('user_id', authUser.id)

    if (error) throw error

    revalidatePath('/following')
    return { success: true }
  } catch (error) {
    console.error('Following action error:', error)
    return { error: 'Aktion fehlgeschlagen' }
  }
}
