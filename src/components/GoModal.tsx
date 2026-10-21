'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Overlay shell for the intercepted `@modal/(...)go/[productId]` route —
 * keeps the page the user clicked from mounted underneath instead of
 * navigating away. Closing (backdrop click, Escape, or back navigation)
 * goes through `router.back()` so the browser history/URL stays correct.
 */
export function GoModal({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => router.back()}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
