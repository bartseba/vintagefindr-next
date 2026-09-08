'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Ported from `app/routes/auth.callback.tsx`. Handles Supabase's magic-link
 * PKCE code exchange (and the legacy implicit-flow hash-token case) after
 * an email redirect, then bounces to `redirectTo` with `?emailConfirmed=true`
 * so `AuthModalsProvider` shows the confirmation toast.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vintage-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Anmeldung wird verarbeitet...</p>
      </div>
    </div>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createSupabaseBrowserClient()

      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const redirectTo = searchParams.get('redirectTo') || '/'

      const error = searchParams.get('error') || hashParams.get('error')
      if (error) {
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description')
        router.replace('/?modal=login&error=' + encodeURIComponent(errorDescription || error))
        return
      }

      try {
        // Handle hash params (implicit flow - less common for email confirmation)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken) {
          const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })

          if (setSessionError) {
            console.error('❌ Set session error:', setSessionError)
            router.replace('/?modal=login&error=' + encodeURIComponent(setSessionError.message))
            return
          }

          if (sessionData.session) {
            window.location.href = `${redirectTo}?emailConfirmed=true`
          } else {
            router.replace('/?modal=login&error=' + encodeURIComponent('Keine Session gefunden'))
          }
          return
        }

        // Handle code params (PKCE flow - standard for email confirmation)
        const code = searchParams.get('code')
        if (code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('❌ Code exchange error:', exchangeError)

            if (exchangeError.message.includes('already been used')) {
              router.replace('/?modal=login&error=' + encodeURIComponent(
                'Dieser Link wurde bereits verwendet. Bitte melden Sie sich an oder fordern Sie einen neuen Link an.'
              ))
            } else if (exchangeError.message.includes('code verifier')) {
              router.replace('/?modal=login&error=' + encodeURIComponent(
                'Dieser Link ist ungültig. Bitte fordern Sie einen neuen Link an.'
              ))
            } else {
              router.replace('/?modal=login&error=' + encodeURIComponent(exchangeError.message))
            }
            return
          }

          if (exchangeData.session) {
            window.location.href = `${redirectTo}?emailConfirmed=true`
          } else {
            console.error('❌ No session created from code exchange')
            router.replace('/?modal=login&error=' + encodeURIComponent('Keine Session gefunden'))
          }
          return
        }

        // No code or tokens found - check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          router.replace('/?modal=login&error=' + encodeURIComponent(sessionError.message))
          return
        }

        if (session) {
          window.location.href = redirectTo
        } else {
          router.replace('/?modal=login&error=' + encodeURIComponent('Kein Authentifizierungscode gefunden'))
        }
      } catch (err) {
        console.error('❌ Auth callback error:', err)
        router.replace('/?modal=login&error=' + encodeURIComponent('Ein Fehler ist aufgetreten'))
      }
    }

    handleAuthCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported from Remix as-is
  }, [])

  return <AuthCallbackFallback />
}
