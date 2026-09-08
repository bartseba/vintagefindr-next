'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Toast } from './ui/Toast'

/**
 * Extracted from `app/routes/_index.tsx`'s `?loginSuccess=true` handling —
 * needs `useSearchParams`, so it's split into its own Client Component
 * rather than making the whole homepage a Client Component. Inert until
 * Phase 4 (auth) wires up a redirect that actually sets this param, same
 * as the other auth-dependent links accepted elsewhere in this migration.
 */
export function LoginSuccessToast() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (searchParams.get('loginSuccess') === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to a URL query param on mount/navigation, ported as-is from the working Remix component
      setShowToast(true)
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('loginSuccess')
      const query = newSearchParams.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported from Remix as-is
  }, [searchParams])

  if (!showToast) return null

  return (
    <Toast
      message="Erfolgreich eingeloggt"
      type="success"
      duration={3000}
      onClose={() => setShowToast(false)}
    />
  )
}
