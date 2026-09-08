'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminAuth } from '@/lib/auth/session'
import { logAuditWithRequest } from '@/lib/audit'

export interface DsaReportUpdateState {
  success?: boolean
  error?: string
}

export async function updateDsaReportStatus(_prevState: DsaReportUpdateState, formData: FormData): Promise<DsaReportUpdateState> {
  const { supabase, authUser } = await requireAdminAuth()

  const reportId = formData.get('reportId') as string
  const newStatus = formData.get('status') as string
  const adminNotes = formData.get('adminNotes') as string

  try {
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }

    if (newStatus === 'resolved' || newStatus === 'rejected') {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data: oldReport } = await supabase
      .from('dsa_reports')
      .select('status, admin_notes')
      .eq('id', reportId)
      .single()

    const { error } = await supabase
      .from('dsa_reports')
      .update(updateData)
      .eq('id', reportId)

    if (error) throw error

    await logAuditWithRequest({
      userId: authUser.id,
      userEmail: authUser.email || '',
      actionType: 'update',
      resourceType: 'dsa_report',
      resourceId: reportId,
      oldValue: oldReport ? { status: oldReport.status, adminNotes: oldReport.admin_notes } : {},
      newValue: { status: newStatus, adminNotes },
    })

    revalidatePath('/admin/dsa-reports')
    return { success: true }
  } catch (error) {
    console.error('Error updating DSA report:', error)
    return { error: 'Failed to update report' }
  }
}
