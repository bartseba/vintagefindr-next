import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Ported from `app/routes/login.tsx`. The Remix route was headless
 * (`export default function Login() { return null }` — "the UI is
 * rendered in root.tsx as an overlay") and only mattered for its `loader`
 * (role-based redirect for already-logged-in users) since visiting
 * `/login` as a bare pathname made `root.tsx` show the login modal on an
 * otherwise-blank page. Here `/login` redirects straight to
 * `/?modal=login` instead, so a direct visit lands on the real homepage
 * with the modal open on top — same outcome the app's own
 * `reset-password` route already used, just applied consistently.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (authUser && !error) {
    const { data: isAdminResult } = await supabase.rpc('is_admin', { user_uuid: authUser.id })
    const isAdmin = isAdminResult === true

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('deleted', false)
      .maybeSingle()

    if (isAdmin) redirect('/admin/dashboard')
    if (vendor) redirect('/vendor/dashboard')
    redirect('/dashboard')
  }

  const params = await searchParams
  const query = new URLSearchParams()
  query.set('modal', 'login')
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') query.set(key, value)
  }
  redirect(`/?${query.toString()}`)
}
