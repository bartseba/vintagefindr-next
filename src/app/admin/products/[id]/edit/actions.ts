'use server'

import { redirect } from 'next/navigation'
import { requireAdminAuth } from '@/lib/auth/session'
import { logAuditWithRequest } from '@/lib/audit'

export interface AdminProductEditState {
  error?: string
}

/**
 * Ported from `admin.products_.$id.edit.tsx`'s `action` (`save` branch —
 * the `cancel` branch is dropped, see `AdminProductEditForm`'s doc
 * comment for why).
 */
export async function updateAdminProduct(productId: string, _prevState: AdminProductEditState, formData: FormData): Promise<AdminProductEditState> {
  const { supabase, authUser } = await requireAdminAuth()

  try {
    const title = formData.get('title') as string
    const price = formData.get('price') as string
    const currency = formData.get('currency') as string

    if (!title || title.trim() === '') {
      return { error: 'Titel ist erforderlich' }
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) {
      return { error: 'Preis muss eine gültige positive Zahl sein' }
    }

    if (!currency || !['EUR', 'USD', 'GBP', 'CHF'].includes(currency)) {
      return { error: 'Ungültige Währung' }
    }

    const updates = {
      title: title.trim(),
      brand: (formData.get('brand') as string)?.trim() || null,
      category: (formData.get('category') as string)?.trim() || null,
      description: (formData.get('description') as string)?.trim() || null,
      price: priceNum,
      currency,
      condition: (formData.get('condition') as string) || null,
      availability: (formData.get('availability') as string) || 'in stock',
      tags: (formData.get('tags') as string)?.trim() || null,
      vintage_styles: (formData.get('vintageStyles') as string)?.trim() || null,
      image_url_1: (formData.get('imageUrl1') as string)?.trim() || null,
      image_url_2: (formData.get('imageUrl2') as string)?.trim() || null,
      image_url_3: (formData.get('imageUrl3') as string)?.trim() || null,
      product_url: (formData.get('productUrl') as string)?.trim() || null,
      checkout_url: (formData.get('checkoutUrl') as string)?.trim() || null,
      is_active: formData.get('isActive') === 'on',
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)

    if (error) throw error

    await logAuditWithRequest({
      userId: authUser.id,
      userEmail: authUser.email || '',
      actionType: 'update',
      resourceType: 'product',
      resourceId: productId,
      newValue: updates,
    })
  } catch (error) {
    console.error('Product update error:', error)
    return { error: error instanceof Error ? error.message : 'Fehler beim Speichern' }
  }

  redirect('/admin/products')
}
