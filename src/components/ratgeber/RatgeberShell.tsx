'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CategoryTreeNode } from '@/components/CategoryTreeNode'
import type { GuideCategory } from '@/lib/directus'

interface RatgeberShellProps {
  categoryTree: GuideCategory[]
  breadcrumbs?: GuideCategory[]
  children: ReactNode
}

/**
 * Shared between `/ratgeber` (overview) and `/ratgeber/[...slug]`
 * (category/guide) — both Remix routes (`ratgeber._index.tsx`/
 * `ratgeber.$.tsx`) duplicated this exact mobile-toggle + sidebar +
 * breadcrumb wrapper verbatim. Extracted here to avoid porting it twice.
 * The Remix originals also declared a `searchQuery` state for filtering
 * the sidebar, but never rendered an input that calls its setter — always
 * `''`, so the filter was always a no-op. Dropped; `categoryTree` is used
 * directly.
 */
export function RatgeberShell({ categoryTree, breadcrumbs, children }: RatgeberShellProps) {
  const [showCategories, setShowCategories] = useState(false)

  return (
    <main className="min-h-screen bg-vintage-silverGray">
      <div className="mx-auto xl:container  px-4 py-8 sm:px-6 lg:px-8">
        {/* Mobile Category Toggle Button */}
        <div className="lg:hidden mb-6">
          <Button
            variant="outline"
            onClick={() => setShowCategories(!showCategories)}
            className="w-full"
          >
            <SlidersHorizontal size={16} className="mr-2" />
            {showCategories ? 'Kategorien ausblenden' : 'Kategorien anzeigen'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar - always visible */}
          <aside className={`w-full lg:w-80 flex-shrink-0 ${showCategories ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-lg shadow-sm p-6 vintage-border ">
                <h2 className="text-lg font-semibold mb-4">Kategorien</h2>

                <nav className="space-y-1">
                  {categoryTree.map((category) => (
                    <CategoryTreeNode
                      key={category.id}
                      category={category}
                      level={0}
                      onLinkClick={() => setShowCategories(false)}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="mb-4 flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li>
                    <Link href="/ratgeber" className="hover:text-gray-700">
                      Ratgeber
                    </Link>
                  </li>
                  {breadcrumbs.map((crumb, index) => crumb && (
                    <li key={crumb.id} className="flex items-center">
                      <span className="mx-2">/</span>
                      {index === breadcrumbs.length - 1 ? (
                        <span className="text-gray-900 font-medium">{crumb.name}</span>
                      ) : (
                        <Link
                          href={`/ratgeber/${breadcrumbs
                            .slice(0, index + 1)
                            .map((c) => c?.slug)
                            .join('/')}`}
                          className="hover:text-gray-700"
                        >
                          {crumb.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
