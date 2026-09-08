import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { HeaderPrimary } from '@/components/HeaderPrimary'
import { Footer } from '@/components/Footer'
import { VendorLoginForm } from '@/components/auth/VendorLoginForm'

export default async function VendorLoginPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (authUser && !error) {
    redirect('/vendor/dashboard')
  }

  return (
    <>
      <HeaderPrimary user={null} userFavorites={[]} />
      <Suspense fallback={null}>
        <VendorLoginForm />
      </Suspense>
      <Footer partner={false} showPrice={false} />
    </>
  )
}
