'use server'

import { redirect } from 'next/navigation'
import { requireVendorAuth } from '@/lib/auth/session'

export interface CreateProductState {
  errors?: Record<string, string>
}

/**
 * Ported from `vendor.products_.new.tsx`'s `action`. Uses `useActionState`
 * on the client (`prevState` unused, matches the `KontaktForm`/`RegisterForm`
 * pattern established since Phase 4) instead of Remix's `useActionData`.
 */
export async function createProduct(_prevState: CreateProductState, formData: FormData): Promise<CreateProductState> {
  const { supabase, vendor } = await requireVendorAuth()

  const priceRaw = formData.get('price') as string
  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    brand: formData.get('brand') as string,
    category: formData.get('category') as string,
    vintageStyle: formData.get('vintageStyle') as string,
    price: parseFloat(priceRaw),
    currency: 'EUR',
    condition: formData.get('condition') as string,
    availability: (formData.get('availability') as string) || 'in_stock',
    stockQty: formData.get('stockQty') ? parseInt(formData.get('stockQty') as string) : null,
    shippingCost: formData.get('shippingCost') ? parseFloat(formData.get('shippingCost') as string) : null,
    freeShippingThreshold: formData.get('freeShippingThreshold') ? parseFloat(formData.get('freeShippingThreshold') as string) : null,
    deliveryTimeMinDays: formData.get('deliveryTimeMinDays') ? parseInt(formData.get('deliveryTimeMinDays') as string) : null,
    deliveryTimeMaxDays: formData.get('deliveryTimeMaxDays') ? parseInt(formData.get('deliveryTimeMaxDays') as string) : null,
    taxIncluded: formData.get('taxIncluded') === 'true',
    imageUrl1: formData.get('imageUrl1') as string,
    imageUrl2: formData.get('imageUrl2') as string,
    imageUrl3: formData.get('imageUrl3') as string,
    productUrl: formData.get('productUrl') as string,
    tags: formData.get('tags') as string,
    externalProductId: formData.get('externalProductId') as string,
    size: formData.get('size') as string,
    publishNow: formData.get('publishNow') === 'on',
  }

  const errors: Record<string, string> = {}

  if (!data.title) errors.title = 'Titel ist erforderlich'
  if (!data.description) errors.description = 'Beschreibung ist erforderlich'
  if (!data.price || isNaN(data.price)) errors.price = 'Gültiger Preis ist erforderlich'
  if (!data.brand) errors.brand = 'Marke ist erforderlich'
  if (!data.category) errors.category = 'Kategorie ist erforderlich'
  if (!data.size) errors.size = 'Größe ist erforderlich'
  if (!data.imageUrl1) errors.imageUrl1 = 'Hauptbild ist erforderlich'
  if (!data.productUrl) errors.productUrl = 'Produkt-URL ist erforderlich'

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  const { data: vendorData } = await supabase
    .from('vendors')
    .select('store_name, store_location, store_website')
    .eq('id', vendor.id)
    .single()

  const [brandSuggestion, categorySuggestion, sizeSuggestion] = await Promise.all([
    supabase
      .from('brand_suggestions')
      .select('id, status')
      .eq('vendor_id', vendor.id)
      .eq('brand_name', data.brand)
      .maybeSingle(),
    supabase
      .from('category_suggestions')
      .select('id, status')
      .eq('vendor_id', vendor.id)
      .eq('category_name', data.category)
      .maybeSingle(),
    supabase
      .from('size_suggestions')
      .select('id, status')
      .eq('vendor_id', vendor.id)
      .eq('size_value', data.size)
      .maybeSingle(),
  ])

  const hasPendingSuggestions =
    brandSuggestion.data?.status === 'pending' ||
    categorySuggestion.data?.status === 'pending' ||
    sizeSuggestion.data?.status === 'pending'

  const isActive = data.publishNow && !hasPendingSuggestions

  const { error } = await supabase
    .from('products')
    .insert({
      vendor_id: vendor.id,
      vendor: vendorData?.store_name || vendor.store_name,
      vendor_location: vendorData?.store_location || null,
      vendor_website: vendorData?.store_website || null,
      external_product_id: data.externalProductId?.trim() || null,
      title: data.title,
      description: data.description || null,
      brand: data.brand,
      category: data.category || null,
      vintage_styles: data.vintageStyle || null,
      price: data.price,
      currency: data.currency,
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
      stock_qty: data.stockQty,
      tags: data.tags || null,
      size: data.size || null,
      is_active: isActive,
      has_pending_suggestions: hasPendingSuggestions,
      suggested_brand_id: brandSuggestion.data?.status === 'pending' ? brandSuggestion.data.id : null,
      suggested_category_id: categorySuggestion.data?.status === 'pending' ? categorySuggestion.data.id : null,
      suggested_size_id: sizeSuggestion.data?.status === 'pending' ? sizeSuggestion.data.id : null,
      deleted: false,
    })

  if (error) {
    return { errors: { general: 'Fehler beim Erstellen des Produkts: ' + error.message } }
  }

  redirect('/vendor/products')
}
