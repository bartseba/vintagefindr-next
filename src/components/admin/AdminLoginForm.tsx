'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { companyName } from '@/constant/routes'
import { adminSignIn, type AdminLoginState } from '@/app/admin/login/actions'

const initialState: AdminLoginState = {}

export function AdminLoginForm() {
  const [state, formAction, isSubmitting] = useActionState(adminSignIn, initialState)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-amber-600 mb-2">{companyName}</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Login
          </h2>
          <p className="text-gray-600">
            Melden Sie sich in das Admin-Panel an
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form action={formAction} className="space-y-6">
            <Input
              name="email"
              type="email"
              label="E-Mail Adresse"
              placeholder="admin@vintagefinder.com"
              required
            />

            <Input
              name="password"
              type="password"
              label="Passwort"
              placeholder="Ihr Admin-Passwort"
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
              {isSubmitting ? 'Wird angemeldet...' : 'Als Admin anmelden'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Kein Admin-Account?{' '}
              <Link
                href="/login"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
