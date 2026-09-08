'use server'

import { requireAdminAuth } from '@/lib/auth/session'

export interface AdminProductActionResult {
  success?: boolean
  message?: string
  error?: string
}

export async function activateAdminProduct(productId: string): Promise<AdminProductActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('products')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) {
    console.error('Product action error:', error)
    return { error: 'Aktion fehlgeschlagen' }
  }

  return { success: true, message: 'Produkt aktiviert' }
}

export async function deactivateAdminProduct(productId: string): Promise<AdminProductActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) {
    console.error('Product action error:', error)
    return { error: 'Aktion fehlgeschlagen' }
  }

  return { success: true, message: 'Produkt deaktiviert' }
}

/**
 * A real hard delete (`.delete()`), unlike the vendor-facing product
 * delete from sub-phase 6.3 (a soft delete with a `deleted`/`deleted_at`
 * flag) — matches `admin.products.tsx`'s own action exactly, not unified
 * with the vendor-side behavior.
 */
export async function deleteAdminProduct(productId: string): Promise<AdminProductActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error('Product action error:', error)
    return { error: 'Aktion fehlgeschlagen' }
  }

  return { success: true, message: 'Produkt gelöscht' }
}
