'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Toast } from '@/components/ui/Toast'
import { LoginModal } from './LoginModal'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { ResetPasswordModal } from './ResetPasswordModal'

/**
 * Ported from the auth-modal orchestration block in `app/root.tsx` — the
 * global login/forgot-password/reset-password modals that render on top of
 * every page, driven by `?modal=login|forgot-password|reset-password` (or
 * the bare `/login`/`/forgot-password` paths, which behave the same way).
 * Mounted once in the root layout, wrapped in `<Suspense>` since it uses
 * `useSearchParams()`.
 *
 * Not ported: `isSubmittingLogin`/`isSubmittingForgotPassword` (derived
 * from Remix's `navigation.state`/`formAction`) — neither `LoginModal` nor
 * `ForgotPasswordModal` actually reads an `isSubmitting` prop in their JSX
 * (both track their own internal loading state for their client-driven OTP
 * flow), so this was dead plumbing in the original too.
 */
export function AuthModalsProvider() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const isLoginPath = pathname === '/login'
  const isForgotPasswordPath = pathname === '/forgot-password'
  const modalParam = searchParams.get('modal')
  const errorMessage = searchParams.get('error')
  const successMessage = searchParams.get('success')

  const navigateWithParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const newSearchParams = new URLSearchParams(searchParams)
    mutate(newSearchParams)
    const newSearch = newSearchParams.toString()
    router.replace(newSearch ? `${pathname}?${newSearch}` : pathname)
  }, [searchParams, pathname, router])

  // Store error/success messages in state so they persist when URL params are cleared
  useEffect(() => {
    let shouldNavigate = false

    if (errorMessage) {
      if (modalParam === 'login' || isLoginPath) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to a URL query param on mount/navigation, ported as-is from the working Remix component
        setLoginError(errorMessage)
        shouldNavigate = true
      } else if (modalParam === 'forgot-password' || isForgotPasswordPath) {
        shouldNavigate = true
      }
    }

    if (successMessage) {
      if (modalParam === 'login' || isLoginPath) {
        setLoginSuccess(successMessage)
        shouldNavigate = true
      } else if (modalParam === 'forgot-password' || isForgotPasswordPath) {
        shouldNavigate = true
      }
    }

    if (shouldNavigate) {
      navigateWithParams((params) => {
        params.delete('error')
        params.delete('success')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported from Remix as-is
  }, [errorMessage, successMessage, modalParam, isLoginPath, isForgotPasswordPath])

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkAuth()
  }, [])

  // Handle email confirmation toast
  useEffect(() => {
    if (searchParams.get('emailConfirmed') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to a URL query param on mount/navigation, ported as-is from the working Remix component
      setToastMessage('Ihre E-Mail-Adresse wurde erfolgreich bestätigt')
      setShowToast(true)
      navigateWithParams((params) => params.delete('emailConfirmed'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported from Remix as-is
  }, [searchParams])

  const showLoginModal = !isLoggedIn && (modalParam === 'login' || isLoginPath)
  const loginActionData = loginError ? { error: loginError } : loginSuccess ? { success: loginSuccess } : null

  const showForgotPasswordModal = !isLoggedIn && (modalParam === 'forgot-password' || isForgotPasswordPath)

  const showResetPasswordModal = modalParam === 'reset-password'

  const handleCloseLogin = () => {
    setLoginError(null)
    setLoginSuccess(null)
    if (isLoginPath) {
      router.replace('/')
      return
    }
    navigateWithParams((params) => {
      params.delete('modal')
      params.delete('error')
      params.delete('success')
      params.delete('emailConfirmed')
    })
  }

  const handleCloseForgotPassword = () => {
    if (isForgotPasswordPath) {
      router.replace('/')
      return
    }
    navigateWithParams((params) => {
      params.delete('modal')
      params.delete('error')
      params.delete('success')
    })
  }

  const handleCloseResetPassword = () => {
    navigateWithParams((params) => {
      params.delete('modal')
      params.delete('error')
      params.delete('success')
    })
  }

  const handleResetPasswordSuccess = () => {
    router.push('/?modal=login&success=' + encodeURIComponent('Passwort erfolgreich geändert. Bitte melden Sie sich an.'))
  }

  return (
    <>
      {showLoginModal && (
        <LoginModal
          isOpen={true}
          onClose={handleCloseLogin}
          actionData={loginActionData}
          redirectTo={searchParams.get('redirectTo') || ''}
        />
      )}

      {showForgotPasswordModal && (
        <ForgotPasswordModal
          isOpen={true}
          onClose={handleCloseForgotPassword}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          isOpen={true}
          onClose={handleCloseResetPassword}
          onSuccess={handleResetPasswordSuccess}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}
