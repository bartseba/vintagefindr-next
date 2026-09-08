import { getPlatformSetting } from '@/lib/supabase/public'
import { VendorRegisterForm } from '@/components/auth/VendorRegisterForm'

export default async function VendorRegisterPage() {
  const setting = await getPlatformSetting('vendor_starter_clicks')
  let starterClicks = 30
  if (setting) {
    const parsed = parseInt(setting)
    if (!Number.isNaN(parsed)) {
      starterClicks = parsed
    }
  }

  return <VendorRegisterForm starterClicks={starterClicks} />
}
