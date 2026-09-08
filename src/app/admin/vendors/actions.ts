'use server'

import { requireAdminAuth } from '@/lib/auth/session'

export interface VendorActionResult {
  success?: boolean
  message?: string
  error?: string
}

/**
 * Ported from `admin.vendors.tsx`'s `action` (`approve` case). Unlike
 * `admin.dashboard.tsx`'s `approveVendor` (a plain status update, no
 * email), this one also calls the existing `send-vendor-approval-email`
 * Supabase Edge Function — a real asymmetry between the two Remix admin
 * routes' approve flows, preserved rather than unified. The structured
 * `console.log` calls tracking the email attempt's inputs/response are
 * kept (they're diagnostic, tied to the returned `emailStatus`, not
 * stray debug output) — unlike the plain unstructured
 * `console.log('Fetcher response:', ...)`/`console.log('Action triggered:', ...)`
 * on the client side, which were dropped as leftover debugging.
 */
export async function approveVendorWithEmail(vendorId: string): Promise<VendorActionResult> {
  const { supabase } = await requireAdminAuth()

  try {
    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('first_name, last_name, email, store_name')
      .eq('id', vendorId)
      .maybeSingle()

    if (fetchError || !vendor) {
      throw new Error('Vendor nicht gefunden')
    }

    const { error: approveError } = await supabase
      .from('vendors')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', vendorId)

    if (approveError) throw approveError

    let emailStatus = 'nicht versendet'
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

      console.log('Email sending attempt:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        vendorEmail: vendor.email,
        vendorName: `${vendor.first_name} ${vendor.last_name}`,
        storeName: vendor.store_name,
      })

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase credentials for email sending')
        emailStatus = 'Fehler: Fehlende Konfiguration'
      } else {
        const emailResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-vendor-approval-email`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vendorEmail: vendor.email,
              vendorName: `${vendor.first_name} ${vendor.last_name}`,
              storeName: vendor.store_name,
            }),
          }
        )

        const responseText = await emailResponse.text()
        console.log('Email API response:', {
          status: emailResponse.status,
          ok: emailResponse.ok,
          body: responseText,
        })

        if (!emailResponse.ok) {
          console.error('Failed to send approval email:', responseText)
          emailStatus = `Fehler: ${emailResponse.status}`
        } else {
          console.log('Approval email sent successfully')
          emailStatus = 'erfolgreich versendet'
        }
      }
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      emailStatus = `Fehler: ${emailError instanceof Error ? emailError.message : String(emailError)}`
    }

    return {
      success: true,
      message: `Vendor genehmigt. E-Mail ${emailStatus}`,
    }
  } catch (error) {
    console.error('Vendor action error:', error)
    return { error: 'Aktion fehlgeschlagen' }
  }
}

export async function rejectVendorApplication(vendorId: string): Promise<VendorActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('vendors')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', vendorId)

  if (error) {
    console.error('Vendor action error:', error)
    return { error: 'Aktion fehlgeschlagen' }
  }

  return { success: true, message: 'Vendor abgelehnt' }
}

export async function resetVendorStatus(vendorId: string): Promise<VendorActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('vendors')
    .update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', vendorId)

  if (error) {
    console.error('Vendor action error:', error)
    return { error: 'Aktion fehlgeschlagen' }
  }

  return { success: true, message: 'Status zurückgesetzt' }
}
