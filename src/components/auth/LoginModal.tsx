'use client'

import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { User, Mail, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { companyName } from '@/constant/routes'
import { OTPModal } from './OTPModal'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  actionData?: { error?: string; success?: string } | null
  redirectTo?: string
}

/**
 * Ported from app/components/LoginModal.tsx. Note the actual submit flow
 * never went through Remix's `/login` server action — `handleSubmit` below
 * calls `supabase.auth.signInWithOtp()` directly from the client (the
 * `isSubmitting` prop the Remix version received from `root.tsx`'s
 * `navigation.state` was accepted but never read in the JSX either) — this
 * is a fully passwordless, OTP-only login flow.
 */
export function LoginModal({ isOpen, onClose, actionData, redirectTo = '' }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

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

  const handleOTPSuccess = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        setError('Fehler beim Abrufen der Session')
        return
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (vendorError) {
        console.error('Vendor check error:', vendorError)
      }

      if (vendorData) {
        window.location.href = '/vendor/dashboard'
      } else {
        window.location.href = '/?loginSuccess=true'
      }
    } catch (err) {
      console.error('Login redirect error:', err)
      setError('Ein Fehler ist aufgetreten')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm"
        onClick={(e) => {e.stopPropagation(); onClose()}}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className=" inset-0  overflow-y-auto">
        <div className="flex fixed z-[201] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 items-center justify-center p-4">
          <div
            className="w-[calc(100vw_-_50px)] sm:max-w-[450px] relative bg-white rounded-2xl shadow-2xl  p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-vintage-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-vintage-primary mb-2">{companyName}</h1>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Anmelden
              </h2>
              <p className="text-gray-600 text-sm">
                Melden Sie sich in Ihrem Account an
              </p>
            </div>

            {/* Success Message */}
            {actionData?.success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{actionData.success}</p>
              </div>
            )}

            {/* Error Message */}
            {(actionData?.error || error) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{actionData?.error || error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  label="E-Mail Adresse"
                  placeholder="ihre.email@example.com"
                  required
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  Sie erhalten einen 6-stelligen Code per E-Mail zur Anmeldung.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
                    if (emailInput?.value) {
                      setEmail(emailInput.value)
                      setShowOTPModal(true)
                    } else {
                      setError('Bitte geben Sie zuerst Ihre E-Mail-Adresse ein')
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Bereits einen Code erhalten? Code eingeben
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Code wird gesendet...' : 'Anmelden'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">oder</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Noch kein Account?{' '}
                <Link
                  href="/register"
                  className="text-vintage-primary hover:text-vintage-secondary font-medium"
                  onClick={onClose}
                >
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={email}
        onSuccess={handleOTPSuccess}
        type="login"
      />
    </>
  )
}
