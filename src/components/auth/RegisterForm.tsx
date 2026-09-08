'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, User, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { Footer } from '@/components/Footer'
import { OTPModal } from './OTPModal'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { companyName } from '@/constant/routes'

interface FieldErrors {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  general?: string
}

/**
 * Ported from `app/routes/register.tsx`. Passwordless OTP signup: validates
 * via `/api/validate-registration`, sends an email OTP through
 * `supabase.auth.signInWithOtp({ shouldCreateUser: true })`, verifies via
 * `OTPModal`, then creates the profile row through `/api/create-user-profile`
 * before redirecting home. `useBackButtonText` (the Remix version's "Zurück"
 * button label logic) computed a value that was never actually rendered —
 * the header always showed the literal text "Zurück" — so it wasn't ported;
 * the back button here just calls `router.back()`.
 */
export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const [showOTPModal, setShowOTPModal] = useState(false)
  const [registrationEmail, setRegistrationEmail] = useState('')
  const [registrationData, setRegistrationData] = useState<{
    firstName: string
    lastName: string
    username: string
  } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const username = formData.get('username') as string

    try {
      const response = await fetch('/api/validate-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, firstName, lastName, username }),
      })

      const data = await response.json()

      if (data.errors) {
        setFieldErrors(data.errors)
        setIsLoading(false)
        return
      }

      if (data.success) {
        setRegistrationEmail(data.email)
        setRegistrationData({
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
        })

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            shouldCreateUser: true,
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            },
          },
        })

        if (otpError) {
          setError('Fehler beim Senden des Codes: ' + otpError.message)
          setIsLoading(false)
        } else {
          setIsLoading(false)
          setShowOTPModal(true)
        }
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
      setIsLoading(false)
      console.error('Registration error:', err)
    }
  }

  const handleOTPSuccess = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      setError('Fehler beim Abrufen der Session')
      return
    }

    if (registrationData) {
      try {
        await fetch('/api/create-user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            email: registrationEmail,
            firstName: registrationData.firstName,
            lastName: registrationData.lastName,
            username: registrationData.username || null,
          }),
        })
      } catch (error) {
        console.error('Profile creation error:', error)
      }
    }

    window.location.href = '/?loginSuccess=true'
  }

  return (
    <div className="min-h-screen bg-vintage-lightGray ">
      <header className="top-0 bg-white shadow-md border-b-[#EAEAEA] border-b-1 border-solid mb-6 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-vintage-primary"
              >
                <ArrowLeft size={20} />
                <span>Zurück</span>
              </button>
            </div>

            <Logo />
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-vintage-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {companyName} Account erstellen
          </h1>
          <p className="text-gray-600 text-lg">
            Vintage-Suche personalisieren und Lieblingsstücke speichern
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Persönliche Informationen</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    name="firstName"
                    label="Vorname"
                    placeholder="Ihr Vorname"
                    error={fieldErrors.firstName}
                    required
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                </div>

                <div className="relative">
                  <Input
                    name="lastName"
                    label="Nachname"
                    placeholder="Ihr Nachname"
                    error={fieldErrors.lastName}
                    required
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <Input
                  name="username"
                  label="Benutzername (optional)"
                  placeholder="Ihr Benutzername"
                  error={fieldErrors.username}
                  hint="Wird öffentlich angezeigt"
                  className="pl-10"
                />
                <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Account Informationen</h3>

              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  label="E-Mail Adresse"
                  placeholder="ihre.email@example.com"
                  error={fieldErrors.email}
                  required
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Sie erhalten einen 6-stelligen Code per E-Mail zur Verifizierung Ihres Accounts.
                </p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" required className="rounded border-gray-300 mt-1" />
                <span className="text-sm text-gray-600">
                  Ich akzeptiere die{' '}
                  <Link href="/nutzungsbedingungen" target="_blank" className="text-vintage-primary hover:text-amber-700">
                    Nutzungsbedingungen
                  </Link>{' '}
                  und{' '}
                  <Link href="/datenschutz" target="_blank" className="text-vintage-primary hover:text-amber-700">
                    Datenschutzerklärung
                  </Link>
                </span>
              </label>
            </div>

            {/* Error Messages */}
            {(fieldErrors.general || error) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{fieldErrors.general || error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Code wird gesendet...' : 'Registrierung abschließen'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Oder</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Bereits registriert?{' '}
                <Link
                  href="?modal=login"
                  className="text-vintage-primary hover:text-amber-700 font-medium"
                >
                  Hier anmelden
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Sind Sie ein Händler?{' '}
                <Link
                  href="/vendor/register"
                  className="text-vintage-primary hover:text-amber-700 font-medium"
                >
                  Vendor werden
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-16'>
        <Footer partner={true}/>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={registrationEmail}
        onSuccess={handleOTPSuccess}
        type="signup"
      />
    </div>
  )
}
