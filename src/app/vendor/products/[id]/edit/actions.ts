'use server'

import { redirect } from 'next/navigation'
import { requireVendorAuth } from '@/lib/auth/session'
import { deleteImageFromBunny } from '@/lib/bunny-cdn'

export interface UpdateProductState {
  errors?: Record<string, string>
}

/**
 * Ported from `vendor.products_.$id.edit.tsx`'s `action`. Bound with
 * `productId` via `.bind(null, productId)` on the client, matching
 * `useActionState`'s `(prevState, formData)` signature requirement.
 *
 * Deliberately asymmetric with `createProduct` (`../new/actions.ts`),
 * matching the Remix original exactly rather than unifying them:
 * - always sets `is_active: true` on save (no `publishNow` checkbox here)
 * - has a `checkoutUrl` field the create form doesn't
 * - does not touch brand/category/size suggestions at all (no
 *   `suggested_*_id` logic, no `/api/suggestions` wiring)
 * - strips a `has-errors` tag from `tags` on every save (an internal
 *   quality-flag cleared once a vendor re-saves)
 */
export async function updateProduct(productId: string, _prevState: UpdateProductState, formData: FormData): Promise<UpdateProductState> {
  const { supabase, vendor } = await requireVendorAuth()

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    brand: formData.get('brand') as string,
    category: formData.get('category') as string,
    vintageStyle: formData.get('vintageStyle') as string,
    price: parseFloat(formData.get('price') as string),
    condition: formData.get('condition') as string,
    availability: (formData.get('availability') as string) || 'in_stock',
    stockQty: formData.get('stockQty') ? parseInt(formData.get('stockQty') as string) : null,
    imageUrl1: formData.get('imageUrl1') as string,
    imageUrl2: formData.get('imageUrl2') as string,
    imageUrl3: formData.get('imageUrl3') as string,
    productUrl: formData.get('productUrl') as string,
    checkoutUrl: formData.get('checkoutUrl') as string,
    tags: formData.get('tags') as string,
    externalProductId: formData.get('externalProductId') as string,
    size: formData.get('size') as string,
    shippingCost: formData.get('shippingCost') ? parseFloat(formData.get('shippingCost') as string) : null,
    freeShippingThreshold: formData.get('freeShippingThreshold') ? parseFloat(formData.get('freeShippingThreshold') as string) : null,
    deliveryTimeMinDays: formData.get('deliveryTimeMinDays') ? parseInt(formData.get('deliveryTimeMinDays') as string) : null,
    deliveryTimeMaxDays: formData.get('deliveryTimeMaxDays') ? parseInt(formData.get('deliveryTimeMaxDays') as string) : null,
    taxIncluded: formData.get('taxIncluded') === 'true',
  }

  const errors: Record<string, string> = {}

  if (!data.title) errors.title = 'Titel ist erforderlich'
  if (!data.description) errors.description = 'Beschreibung ist erforderlich'
  if (!data.price || isNaN(data.price)) errors.price = 'Gültiger Preis ist erforderlich'
  if (!data.brand) errors.brand = 'Marke ist erforderlich'
  if (!data.category) errors.category = 'Kategorie ist erforderlich'
  if (!data.productUrl) errors.productUrl = 'Produkt-URL ist erforderlich'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  const { data: vendorData } = await supabase
    .from('vendors')
    .select('store_name, store_location, store_website')
    .eq('id', vendor.id)
    .single()

  const { data: currentProduct } = await supabase
    .from('products')
    .select('image_url_1, image_url_2, image_url_3')
    .eq('id', productId)
    .eq('vendor_id', vendor.id)
    .single()

  const currentTags = data.tags || ''
  const tagsArray = currentTags.split(',').map(t => t.trim()).filter(Boolean)
  const cleanedTags = tagsArray.filter(tag => tag !== 'has-errors').join(',')

  const { error } = await supabase
    .from('products')
    .update({
      vendor: vendorData?.store_name || vendor.store_name,
      vendor_location: vendorData?.store_location || null,
      vendor_website: vendorData?.store_website || null,
      title: data.title,
      description: data.description || null,
      brand: data.brand,
      category: data.category || null,
      vintage_styles: data.vintageStyle || null,
      price: data.price,
      condition: data.condition || null,
      availability: data.availability,
      shipping_cost: data.shippingCost,
      free_shipping_threshold: data.freeShippingThreshold,
      delivery_time_min_days: data.deliveryTimeMinDays,
      delivery_time_max_days: data.deliveryTimeMaxDays,
      tax_included: data.taxIncluded,
      image_url_1: data.imageUrl1 || null,
      image_url_2: data.imageUrl2 || null,
      image_url_3: data.imageUrl3 || null,
      product_url: data.productUrl || null,
      checkout_url: data.checkoutUrl || null,
      stock_qty: data.stockQty,
      tags: cleanedTags || null,
      external_product_id: data.externalProductId?.trim() || null,
      size: data.size || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .eq('vendor_id', vendor.id)

  if (error) {
    return { errors: { general: 'Fehler beim Aktualisieren des Produkts: ' + error.message } }
  }

  if (currentProduct) {
    const oldImages = [
      { old: currentProduct.image_url_1, new: data.imageUrl1 },
      { old: currentProduct.image_url_2, new: data.imageUrl2 },
      { old: currentProduct.image_url_3, new: data.imageUrl3 },
    ]

    for (const { old: oldUrl, new: newUrl } of oldImages) {
      if (oldUrl && newUrl && oldUrl !== newUrl) {
        try {
          await deleteImageFromBunny(oldUrl)
        } catch (imgError) {
          console.warn('Could not delete old image from CDN:', oldUrl, imgError)
        }
      }
    }
  }

  redirect('/vendor/products')
}
