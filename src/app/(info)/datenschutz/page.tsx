import type { Metadata } from 'next'
import DatenschutzContent from './DatenschutzContent'

/**
 * Split into a thin Server Component wrapper so `metadata` can be exported
 * here — the actual page content (`DatenschutzContent.tsx`) stays `'use
 * client'` for its consent-status widget (useState/useEffect), and Next.js
 * doesn't allow `metadata` exports from Client Components.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DatenschutzPage() {
  return <DatenschutzContent />
}
