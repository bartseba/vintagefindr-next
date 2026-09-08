'use server'

import { requireVendorAuth } from '@/lib/auth/session'
import { deleteImageFromBunny } from '@/lib/bunny-cdn'

interface ActionResult {
  success?: boolean
  message?: string
  error?: string
}

async function deleteProductImages(imageUrls: (string | null)[]) {
  for (const imageUrl of imageUrls.filter((url): url is string => Boolean(url))) {
    try {
      await deleteImageFromBunny(imageUrl)
    } catch (error) {
      console.warn('Could not delete image from CDN:', imageUrl, error)
    }
  }
}

/**
 * Ported from `vendor.products.tsx`'s `action` — `activate`/`deactivate`/
 * `delete` cases, keyed by `_action` in the Remix version. Split into one
 * function per action here since Server Actions are called directly
 * rather than dispatched through a shared form-data switch.
 */
export async function updateProductStatus(productId: string, action: 'activate' | 'deactivate'): Promise<ActionResult> {
  const { supabase, vendor } = await requireVendorAuth()

  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: action === 'activate', updated_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('vendor_id', vendor.id)

    if (error) throw error

    return { success: true, message: action === 'activate' ? 'Produkt aktiviert' : 'Produkt deaktiviert' }
  } catch (error) {
    console.error('Product action error:', error)
    return { error: 'Fehler beim Ausführen der Aktion' }
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const { supabase, vendor } = await requireVendorAuth()

  try {
    const { data: productToDelete } = await supabase
      .from('products')
      .select('image_url_1, image_url_2, image_url_3')
      .eq('id', productId)
      .eq('vendor_id', vendor.id)
      .single()

    const { error: deleteError } = await supabase
      .from('products')
      .update({
        deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('vendor_id', vendor.id)

    if (deleteError) throw deleteError

    if (productToDelete) {
      await deleteProductImages([
        productToDelete.image_url_1,
        productToDelete.image_url_2,
        productToDelete.image_url_3,
      ])
    }

    return { success: true, message: 'Produkt erfolgreich gelöscht' }
  } catch (error) {
    console.error('Product action error:', error)
    return { error: 'Fehler beim Ausführen der Aktion' }
  }
}

export async function bulkDeleteProducts(productIds: string[]): Promise<ActionResult> {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { error: 'Invalid product IDs' }
  }

  const { supabase, vendor } = await requireVendorAuth()

  try {
    const { data: productsToDelete } = await supabase
      .from('products')
      .select('id, image_url_1, image_url_2, image_url_3')
      .in('id', productIds)
      .eq('vendor_id', vendor.id)

    const { error: bulkDeleteError } = await supabase
      .from('products')
      .update({
        deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', productIds)
      .eq('vendor_id', vendor.id)

    if (bulkDeleteError) throw bulkDeleteError

    if (productsToDelete) {
      for (const product of productsToDelete) {
        await deleteProductImages([product.image_url_1, product.image_url_2, product.image_url_3])
      }
    }

    return { success: true, message: `${productIds.length} Produkte erfolgreich gelöscht` }
  } catch (error) {
    console.error('Product action error:', error)
    return { error: 'Fehler beim Ausführen der Aktion' }
  }
}
