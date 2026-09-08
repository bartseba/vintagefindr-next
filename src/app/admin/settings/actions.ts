'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminAuth } from '@/lib/auth/session'
import { logAuditWithRequest } from '@/lib/audit'

export interface AdminSettingsState {
  success?: boolean
  message?: string
  error?: string
}

export async function updateSettings(_prevState: AdminSettingsState, formData: FormData): Promise<AdminSettingsState> {
  const { supabase, authUser } = await requireAdminAuth()

  const { data: allSettings } = await supabase
    .from('platform_settings')
    .select('key, value')

  if (!allSettings) {
    return { error: 'Failed to load settings' }
  }

  const updates: { key: string; value: string }[] = []
  const submittedKeys = new Set<string>()

  for (const [key, value] of formData.entries()) {
    submittedKeys.add(key)

    let parsedValue: unknown
    try {
      parsedValue = JSON.parse(value as string)
    } catch {
      parsedValue = value === 'on' ? true : value
    }

    updates.push({ key, value: JSON.stringify(parsedValue) })
  }

  for (const setting of allSettings) {
    if (!submittedKeys.has(setting.key)) {
      let currentValue: unknown
      try {
        currentValue = JSON.parse(setting.value)
      } catch {
        currentValue = setting.value
      }

      if (typeof currentValue === 'boolean') {
        updates.push({ key: setting.key, value: JSON.stringify(false) })
      }
    }
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: update.value })
      .eq('key', update.key)

    if (error) {
      console.error('Update error:', error)
      return { error: `Failed to update ${update.key}` }
    }
  }

  const changedSettings: Record<string, { old: unknown; new: unknown }> = {}
  for (const update of updates) {
    const oldSetting = allSettings.find((s) => s.key === update.key)
    if (oldSetting && oldSetting.value !== update.value) {
      changedSettings[update.key] = { old: oldSetting.value, new: update.value }
    }
  }

  if (Object.keys(changedSettings).length > 0) {
    await logAuditWithRequest({
      userId: authUser.id,
      userEmail: authUser.email || '',
      actionType: 'update',
      resourceType: 'settings',
      oldValue: changedSettings,
      newValue: { updatedKeys: Object.keys(changedSettings) },
    })
  }

  revalidatePath('/admin/settings')
  return { success: true, message: 'Settings updated successfully' }
}
