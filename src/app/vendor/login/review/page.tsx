import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { VendorReviewLoginForm } from '@/components/vendor/VendorReviewLoginForm'

export default async function VendorReviewLoginPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (authUser && !error) {
    redirect('/vendor/dashboard')
  }

  return <VendorReviewLoginForm />
}
