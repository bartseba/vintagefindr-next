'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { vendorReviewSignIn, type VendorReviewLoginState } from '@/app/vendor/login/review/actions'

const initialState: VendorReviewLoginState = {}

/**
 * Password-based vendor login used only by app-store reviewers.
 * Not linked from any nav — see actions.ts for the allowlist gate.
 */
export function VendorReviewLoginForm() {
  const [state, formAction, isSubmitting] = useActionState(vendorReviewSignIn, initialState)

  return (
    <div className="min-h-screen bg-vintage-silverGray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-vintage-secondary mb-2">
            Vendor Login
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form action={formAction} className="space-y-6">
            <Input
              name="email"
              type="email"
              label="E-Mail Adresse"
              required
            />

            <Input
              name="password"
              type="password"
              label="Passwort"
              required
            />

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{state.error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Wird angemeldet...' : 'Anmelden'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
