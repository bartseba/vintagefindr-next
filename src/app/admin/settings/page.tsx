import { requireAdminAuth } from '@/lib/auth/session'
import { AdminSettingsView, type PlatformSetting } from '@/components/admin/AdminSettingsView'

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdminAuth()

  const { data: settings, error } = await supabase
    .from('platform_settings')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    console.error('Settings load error:', error)
    throw new Error(`Failed to load settings: ${error.message}`)
  }

  const groupedSettings = (settings as PlatformSetting[]).reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, PlatformSetting[]>)

  return <AdminSettingsView settings={groupedSettings} />
}
