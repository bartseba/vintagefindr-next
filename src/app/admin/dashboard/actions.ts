'use server'

import { redirect } from 'next/navigation'
import { requireAdminAuth } from '@/lib/auth/session'

export interface AdminActionResult {
  success?: boolean
  message?: string
  error?: string
}

/**
 * Ported from `admin.dashboard.tsx`'s `action` (`_action=logout`) — the
 * one real `<Form>` submission on this page; invoked directly via
 * `<form action={logoutAdmin}>`.
 */
export async function logoutAdmin(): Promise<void> {
  const { supabase } = await requireAdminAuth()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Ported from the `approve_vendor`/`reject_vendor` branches — dispatched
 * via `fetcher.submit` from plain `onClick` handlers in the Remix
 * original (not a real form), so called directly here too.
 */
export async function approveVendor(vendorId: string): Promise<AdminActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('vendors')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', vendorId)

  if (error) {
    console.error('Admin action error:', error)
    return { error: 'Action failed' }
  }

  return { success: true, message: 'Vendor approved successfully' }
}

export async function rejectVendor(vendorId: string): Promise<AdminActionResult> {
  const { supabase } = await requireAdminAuth()

  const { error } = await supabase
    .from('vendors')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', vendorId)

  if (error) {
    console.error('Admin action error:', error)
    return { error: 'Action failed' }
  }

  return { success: true, message: 'Vendor rejected successfully' }
}
