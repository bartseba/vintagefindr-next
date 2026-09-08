import type { Metadata } from 'next'
import PageHeader from '@/components/PageHeader'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { requireAuthUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  const { supabase, authUser } = await requireAuthUser('/profile')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const user = userData || {
    id: authUser.id,
    email: authUser.email,
    first_name: '',
    last_name: '',
    username: null,
    avatar_url: null,
    bio: null,
    location: null,
    website: null,
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader backLink="/dashboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileForm user={user} />
      </div>
    </div>
  )
}
