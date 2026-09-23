'use client'
interface CategoryHeroProps {
  h1?: string
  /** Pre-sanitized HTML — sanitize server-side before passing in, `sanitizeHTML` is `server-only`. */
  safeHtml?: string
}

/**
 * Redesign of the old `IntroSection` (kept as-is, unused for now, not
 * deleted). Rendered inside `CategorySearch`'s `InstantSearchNext` tree
 * (not in the Server Component page).
 */
export function CategoryHero({ h1, safeHtml }: CategoryHeroProps) {
  if (!h1 && !safeHtml) return null

  return (
    <div className="mb-4 border-b border-gray-200 pb-4">
      {h1 && (
        <h1 className="font-playfair text-4xl lg:text-4xl uppercase text-gray-900 lg:max-w-[640px]">
          {h1}
        </h1>
      )}
      {safeHtml && (
        <div
          className="prose prose-sm mt-3 max-w-4xl text-gray-600"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      )}
    </div>
  )
}
