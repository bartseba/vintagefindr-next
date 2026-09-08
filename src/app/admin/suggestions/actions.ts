'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { logAuditWithRequest } from '@/lib/audit'

export interface SuggestionActionResult {
  success?: boolean
  error?: string
}

/**
 * Ported from `admin.suggestions.tsx`'s `action`. That route checks admin
 * status via the `is_admin()` RPC directly, not `requireAdminAuth`'s
 * `user_roles` query — the same pre-existing inconsistency already
 * documented in sub-phase 7.1/7.7, preserved here rather than unified.
 */
export async function reviewSuggestion(
  suggestionId: string,
  suggestionType: 'brand' | 'category' | 'size',
  decision: 'approve' | 'reject'
): Promise<SuggestionActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: isAdminResult } = await supabase.rpc('is_admin', { user_uuid: user.id })
  if (isAdminResult !== true) {
    return { error: 'Forbidden' }
  }

  const tableName = `${suggestionType}_suggestions`
  const newStatus = decision === 'approve' ? 'approved' : 'rejected'

  try {
    const { error } = await supabase
      .from(tableName)
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)

    if (error) throw error

    if (decision === 'approve') {
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq(`suggested_${suggestionType}_id`, suggestionId)
        .eq('has_pending_suggestions', true)

      if (products && products.length > 0) {
        await supabase
          .from('products')
          .update({ has_pending_suggestions: false, is_active: true })
          .in('id', products.map((p) => p.id))
      }
    }

    await logAuditWithRequest({
      userId: user.id,
      userEmail: user.email || '',
      actionType: decision === 'approve' ? 'approve' : 'reject',
      resourceType: 'suggestion',
      resourceId: suggestionId,
      oldValue: { status: 'pending' },
      newValue: { status: newStatus, type: suggestionType },
    })

    return { success: true }
  } catch (error) {
    console.error('Suggestion review error:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
