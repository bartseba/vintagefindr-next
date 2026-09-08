'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { OTPModal } from '@/components/auth/OTPModal'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function VendorLoginForm() {
  const searchParams = useSearchParams()
  const isDeleted = searchParams.get('deleted') === 'true'
  const isAccountDeleted = searchParams.get('error') === 'account_deleted'
  const [email, setEmail] = useState('')
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const emailValue = formData.get('email') as string

    if (!emailValue) {
      setError('E-Mail Adresse ist erforderlich')
      setIsLoading(false)
      return
    }

    setEmail(emailValue)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailValue,
      options: {
        shouldCreateUser: false,
      },
    })

    if (otpError) {
      setError(otpError.message)
      setIsLoading(false)
    } else {
      setIsLoading(false)
      setShowOTPModal(true)
    }
  }

  const handleOTPSuccess = () => {
    window.location.href = '/vendor/dashboard'
  }

  return (
    <div className="min-h-screen bg-vintage-silverGray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 border border-gray-100 p-8">
      <div className="max-w-md w-full p-8 bg-white min-w-[600px] vintage-border rounded-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-vintage-secondary mb-2">
            Vendor Login
          </h2>
          <p className="text-vintage-secondary mb-6">
            Melden Sie sich in Ihrem Vendor Account an
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {isDeleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm">
                Ihr Account wurde erfolgreich gelöscht.
              </p>
            </div>
          )}

          {isAccountDeleted && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm font-medium">
                Dieser Account wurde gelöscht und kann nicht mehr verwendet werden.
              </p>
              <p className="text-red-600 text-sm mt-2">
                Wenn Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte unseren Support.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="email"
              type="email"
              label="E-Mail Adresse"
              placeholder="ihre.email@example.com"
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                Sie erhalten einen 6-stelligen Code per E-Mail zur Anmeldung.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Code wird gesendet...' : 'Anmelden'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Noch kein Account?{' '}
              <Link
                href="/vendor/register"
                className="text-vintage-primary hover:text-vintage-secondary font-medium"
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={email}
        onSuccess={handleOTPSuccess}
        type="login"
        isVendor={true}
      />
    </div>
  )
}
