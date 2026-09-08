'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireVendorAuth } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export interface SettingsActionResult {
  success?: boolean
  message?: string
  error?: string
}

export interface UpdateSettingsState {
  errors?: Record<string, string>
  success?: boolean
  message?: string
}

export async function pauseAccount(): Promise<SettingsActionResult> {
  const { supabase, vendor } = await requireVendorAuth()

  const { error } = await supabase
    .from('vendors')
    .update({ is_active: false, paused_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', vendor.id)

  if (error) {
    return { error: 'Fehler beim Pausieren des Accounts: ' + error.message }
  }

  revalidatePath('/vendor/settings')
  revalidatePath('/vendor/dashboard')
  return { success: true, message: 'Account wurde pausiert. Ihre Produkte sind jetzt nicht mehr öffentlich sichtbar.' }
}

export async function activateAccount(): Promise<SettingsActionResult> {
  const { supabase, vendor } = await requireVendorAuth()

  const { error } = await supabase
    .from('vendors')
    .update({ is_active: true, paused_at: null, updated_at: new Date().toISOString() })
    .eq('id', vendor.id)

  if (error) {
    return { error: 'Fehler beim Aktivieren des Accounts: ' + error.message }
  }

  revalidatePath('/vendor/settings')
  revalidatePath('/vendor/dashboard')
  return { success: true, message: 'Account wurde aktiviert. Ihre Produkte sind jetzt wieder öffentlich sichtbar.' }
}

/**
 * Ported from `vendor.settings.tsx`'s `intent === 'delete-account'` branch.
 * Soft-deletes products + the vendor row, signs out, then hard-deletes the
 * `auth.users` row via the service-role admin client — the one legitimate
 * use of that client (only the Auth Admin API can delete auth users).
 */
export async function deleteVendorAccount(): Promise<void> {
  const { supabase, authUser, vendor } = await requireVendorAuth()

  const { error: softDeleteProductsError } = await supabase
    .from('products')
    .update({ deleted: true, deleted_at: new Date().toISOString(), is_active: false, updated_at: new Date().toISOString() })
    .eq('vendor_id', vendor.id)
    .eq('deleted', false)

  if (softDeleteProductsError) {
    console.error('Error soft deleting products:', softDeleteProductsError)
  }

  const { error: softDeleteVendorError } = await supabase
    .from('vendors')
    .update({ deleted: true, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', vendor.id)

  if (softDeleteVendorError) {
    console.error('Error deleting vendor account:', softDeleteVendorError)
    return
  }

  await supabase.auth.signOut()

  const supabaseAdmin = createSupabaseAdminClient()
  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)
  if (deleteAuthError) {
    console.error('Error deleting auth user:', deleteAuthError)
  }

  redirect('/?deleted=true')
}

/**
 * Ported from `vendor.settings.tsx`'s `action` default branch (the main
 * profile-update form).
 */
export async function updateVendorSettings(_prevState: UpdateSettingsState, formData: FormData): Promise<UpdateSettingsState> {
  const { supabase, vendor } = await requireVendorAuth()

  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    storeName: formData.get('storeName') as string,
    storeWebsite: formData.get('storeWebsite') as string,
    storeLocation: formData.get('storeLocation') as string,
    ecommercePlatform: formData.get('ecommercePlatform') as string,
    inventorySystem: formData.get('inventorySystem') as string,
    numberOfItems: formData.get('numberOfItems') ? parseInt(formData.get('numberOfItems') as string) : null,
    monthlyClickGoal: formData.get('monthlyClickGoal') ? parseInt(formData.get('monthlyClickGoal') as string) : 2000,
    ctrGoal: formData.get('ctrGoal') ? parseFloat(formData.get('ctrGoal') as string) : 5.0,
    avatarUrl: formData.get('avatarUrl') as string | null,
    shopifyDomain: formData.get('shopifyDomain') as string | null,
  }

  const errors: Record<string, string> = {}

  if (!data.firstName) errors.firstName = 'Vorname ist erforderlich'
  if (!data.lastName) errors.lastName = 'Nachname ist erforderlich'
  if (!data.email) errors.email = 'E-Mail ist erforderlich'
  if (!data.storeName) errors.storeName = 'Store Name ist erforderlich'
  if (data.monthlyClickGoal <= 0) errors.monthlyClickGoal = 'Klick-Ziel muss größer als 0 sein'
  if (data.ctrGoal < 0 || data.ctrGoal > 100) errors.ctrGoal = 'CTR-Ziel muss zwischen 0 und 100% liegen'

  if (data.shopifyDomain && data.shopifyDomain.trim()) {
    const normalizedDomain = data.shopifyDomain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .toLowerCase()

    if (!normalizedDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.(myshopify\.com|shopifypreview\.com)$/)) {
      errors.shopifyDomain = 'Ungültige Shopify-Domain. Bitte verwenden Sie das Format: ihr-shop.myshopify.com oder ihr-shop.shopifypreview.com'
    } else {
      data.shopifyDomain = normalizedDomain
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, success: false }
  }

  const { error } = await supabase
    .from('vendors')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      store_name: data.storeName,
      store_website: data.storeWebsite || null,
      store_location: data.storeLocation || null,
      ecommerce_platform: data.ecommercePlatform || null,
      inventory_system: data.inventorySystem || null,
      number_of_items: data.numberOfItems,
      monthly_click_goal: data.monthlyClickGoal,
      ctr_goal: data.ctrGoal,
      avatar_url: data.avatarUrl || null,
      shopify_domain: data.shopifyDomain || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendor.id)

  if (error) {
    return { errors: { general: 'Fehler beim Aktualisieren des Profils: ' + error.message }, success: false }
  }

  revalidatePath('/vendor/settings')
  return { success: true, message: 'Profil erfolgreich aktualisiert!' }
}

/**
 * Backs the `ShopifyDomainModal`'s save action. Deliberate simplification
 * over the Remix original, which resubmitted the *entire* settings form
 * (all vendor fields) through the general update action using stale
 * client-held `vendor.*` values — silently discarding any unsaved edits
 * already typed into the main form. This updates only the domain field
 * directly against the current DB row instead, which achieves the same
 * net persisted result without that data-loss footgun.
 */
export async function updateShopifyDomain(domain: string): Promise<SettingsActionResult> {
  const { supabase, vendor } = await requireVendorAuth()

  const { error } = await supabase
    .from('vendors')
    .update({ shopify_domain: domain || null, updated_at: new Date().toISOString() })
    .eq('id', vendor.id)

  if (error) {
    return { error: 'Fehler beim Speichern der Domain: ' + error.message }
  }

  revalidatePath('/vendor/settings')
  revalidatePath('/vendor/import')
  return { success: true }
}
