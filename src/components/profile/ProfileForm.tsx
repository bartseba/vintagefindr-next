'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Save } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AvatarUpload } from '@/components/AvatarUpload'
import { DeleteAccountModal } from '@/components/DeleteAccountModal'
import { updateProfile, deleteAccountAction, type UpdateProfileState } from '@/app/profile/actions'

export interface ProfileUser {
  id: string
  email?: string
  first_name?: string | null
  last_name?: string | null
  username?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  avatar_url?: string | null
}

const initialState: UpdateProfileState = {}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  const handleDeleteAccount = async () => {
    const result = await deleteAccountAction()
    if (result?.error) {
      // deleteAccountAction redirects on success (throws internally), so
      // reaching here with an error means the delete genuinely failed
      alert(result.error)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mein Profil
          </h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre persönlichen Informationen
          </p>
        </div>

        <form action={formAction} className="space-y-8">
          <AvatarUpload
            currentUrl={avatarUrl}
            fallbackText={user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            onUploadComplete={setAvatarUrl}
          />
          <input type="hidden" name="avatarUrl" value={avatarUrl} />

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Persönliche Informationen</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="firstName"
                label="Vorname"
                placeholder="Ihr Vorname"
                defaultValue={user.first_name || ''}
                error={state.errors?.firstName}
                required
              />

              <Input
                name="lastName"
                label="Nachname"
                placeholder="Ihr Nachname"
                defaultValue={user.last_name || ''}
                error={state.errors?.lastName}
                required
              />
            </div>

            <Input
              name="username"
              label="Benutzername"
              placeholder="Ihr Benutzername"
              defaultValue={user.username || ''}
              hint="Wird öffentlich angezeigt"
            />

            <Input
              name="email"
              type="email"
              label="E-Mail Adresse"
              value={user.email}
              disabled
              hint="E-Mail kann nicht geändert werden"
            />
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Zusätzliche Informationen</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                rows={4}
                className="input-field"
                placeholder="Erzählen Sie etwas über sich..."
                defaultValue={user.bio || ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="location"
                label="Standort"
                placeholder="z.B. Berlin, Deutschland"
                defaultValue={user.location || ''}
              />

              <Input
                name="website"
                label="Website"
                placeholder="https://ihre-website.com"
                defaultValue={user.website || ''}
              />
            </div>
          </div>

          {/* Success/Error Messages */}
          {state.success && state.message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm font-medium">{state.message}</p>
            </div>
          )}

          {state.errors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{state.errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Abbrechen
              </Button>
            </Link>

            <Button type="submit" isLoading={isPending}>
              <Save size={16} className="mr-2" />
              {isPending ? 'Wird gespeichert...' : 'Profil speichern'}
            </Button>
          </div>
        </form>
      </div>

      {/* Additional Settings */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Weitere Einstellungen</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h4 className="font-medium text-red-900">Account löschen</h4>
              <p className="text-sm text-red-700">Permanent Ihren Account und alle Daten löschen</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteAccountModal(true)}
              type="button"
            >
              Account löschen
            </Button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleDeleteAccount}
        vendorEmail={user.email || ''}
      />
    </>
  )
}
