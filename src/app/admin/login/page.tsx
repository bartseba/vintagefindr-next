import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (authUser && !error) {
    const { data: isAdminResult } = await supabase.rpc('is_admin', { user_uuid: authUser.id })
    if (isAdminResult === true) {
      redirect('/admin/dashboard')
    }
  }

  return <AdminLoginForm />
}
