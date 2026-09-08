'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

export interface UpdateProfileState {
  errors?: {
    firstName?: string
    lastName?: string
    general?: string
  }
  success?: boolean
  message?: string
}

/**
 * Ported from `app/routes/profile.tsx`'s `action` (profile-update branch).
 */
export async function updateProfile(_prevState: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (!authUser || authError) {
    redirect('/?modal=login')
  }

  const data = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    username: formData.get('username') as string,
    bio: formData.get('bio') as string,
    location: formData.get('location') as string,
    website: formData.get('website') as string,
    avatarUrl: formData.get('avatarUrl') as string,
  }

  const errors: NonNullable<UpdateProfileState['errors']> = {}

  if (!data.firstName) errors.firstName = 'Vorname ist erforderlich'
  if (!data.lastName) errors.lastName = 'Nachname ist erforderlich'

  if (Object.keys(errors).length > 0) {
    return { errors, success: false }
  }

  const { error } = await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      email: authUser.email!,
      first_name: data.firstName,
      last_name: data.lastName,
      username: data.username || null,
      bio: data.bio || null,
      location: data.location || null,
      website: data.website || null,
      avatar_url: data.avatarUrl || null,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return {
      errors: { general: 'Fehler beim Aktualisieren des Profils: ' + error.message },
      success: false,
    }
  }

  revalidatePath('/profile')
  return { success: true, message: 'Profil erfolgreich aktualisiert!' }
}

/**
 * Ported from `app/routes/profile.tsx`'s `action` (delete-account branch).
 * Signs out, then uses the service-role admin client to delete the auth
 * user — `user_favorites`/`user_follows`/`users` rows cascade-delete via
 * FK constraints, same as the Remix original's comment describes.
 */
export async function deleteAccountAction(): Promise<{ error?: string } | void> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (!authUser || authError) {
    redirect('/?modal=login')
  }

  await supabase.auth.signOut()

  const supabaseAdmin = createSupabaseAdminClient()
  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)

  if (deleteAuthError) {
    console.error('Error deleting auth user:', deleteAuthError)
    return { error: 'Fehler beim Löschen des Accounts: ' + deleteAuthError.message }
  }

  redirect('/?deleted=true')
}
