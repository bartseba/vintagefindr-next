import type { Metadata } from 'next'

/**
 * Same rationale as src/app/admin/layout.tsx: no /vendor/* route had its own
 * meta in the live Remix app, so all of them (including login/register)
 * inherited root.tsx's blanket `robots: index, follow`. Noindex here is a
 * deliberate improvement, not a ported behavior.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return children
}
