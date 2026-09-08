import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (authUser && !error) {
    redirect('/')
  }

  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
