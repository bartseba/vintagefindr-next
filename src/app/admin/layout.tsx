import type { Metadata } from 'next'

/**
 * The live Remix app had no per-route meta for any /admin/* route, so every
 * one inherited root.tsx's blanket `robots: index, follow` — these are
 * auth-gated internal pages with no public SEO value, so noindex here is a
 * deliberate improvement over that inherited default, not a ported behavior.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
