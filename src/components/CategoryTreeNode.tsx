'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { GuideCategory } from '@/lib/directus'

interface CategoryTreeNodeProps {
  category: GuideCategory
  level: number
  onLinkClick?: () => void
  /**
   * Joined slug path of this category's ancestors (empty at the root).
   * Nested categories (e.g. "Vintage Sizing" under "Grundlagen") need their
   * full parent chain in the URL — `getGuideCategoryBySlugPath` resolves
   * `/ratgeber/grundlagen/vintage-sizing-guide`, not the bare leaf slug.
   * Linking with just `category.slug` 404s for any non-top-level category
   * (confirmed live: a "Vintage Sizing" sidebar link 404ed exactly this way).
   */
  ancestorPath?: string
}

// Helper function to check if current path matches or is a child of the category
function isPathActive(pathname: string, categorySlug: string, children?: GuideCategory[]): boolean {
  const pathSegments = pathname.replace('/ratgeber/', '').split('/')

  // Check if the category slug is in the path
  if (pathSegments.includes(categorySlug)) {
    return true
  }

  // Check if any child matches
  if (children && children.length > 0) {
    return children.some(child => isPathActive(pathname, child.slug, child.children))
  }

  return false
}

export function CategoryTreeNode({ category, level, onLinkClick, ancestorPath = '' }: CategoryTreeNodeProps) {
  const pathname = usePathname()
  const hasChildren = category.children && category.children.length > 0

  // Check if this category or any of its children are active
  const isActive = isPathActive(pathname, category.slug, category.children)

  const [isOpen, setIsOpen] = useState(isActive)

  // Update isOpen when the route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs open/closed state with the active route, ported as-is from the working Remix component
    setIsOpen(isActive)
  }, [isActive])

  // Some `guide_categories.slug` values already embed a path prefix as
  // literal data (e.g. "marken/stone-island-vintage-guide",
  // "vintage-shops/muenster") — inconsistent CMS authoring, confirmed live:
  // for those, the slug alone is already the correct/working path, and
  // prepending `ancestorPath` on top would double it into a 404
  // (`/ratgeber/marken/marken/...`). Only bare slugs (no "/") need the
  // accumulated ancestor path prepended.
  const slugPath = category.slug.includes('/')
    ? category.slug
    : ancestorPath
      ? `${ancestorPath}/${category.slug}`
      : category.slug

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return level === 0 ? (
    <ul>
      <li className="flex items-center gap-2 py-2 rounded hover:bg-gray-50">
        {hasChildren && (
          <button
            onClick={toggleOpen}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isOpen ? 'Kategorie zuklappen' : 'Kategorie aufklappen'}
          >
            {isOpen ? (
              <ChevronDown size={16} className="text-gray-600" />
            ) : (
              <ChevronRight size={16} className="text-gray-600" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <Link
          href={`/ratgeber/${slugPath}`}
          className="flex-1 text-md text-gray-700 hover:text-gray-900 font-bold"
          onClick={onLinkClick}
        >
          {category.name}
        </Link>
      </li>

      {hasChildren && isOpen && (
        <>
          {category.children!.map(child => (
            <CategoryTreeNode key={child.id} category={child} level={level + 1} onLinkClick={onLinkClick} ancestorPath={slugPath} />
          ))}
        </>
      )}
    </ul>
  ) : (
    <li className="ml-6">
      <h4 className="flex items-center gap-2 py-1 rounded hover:bg-gray-50">
        {hasChildren && (
          <button
            onClick={toggleOpen}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isOpen ? 'Kategorie zuklappen' : 'Kategorie aufklappen'}
          >
            {isOpen ? (
              <ChevronDown size={14} className="text-gray-600" />
            ) : (
              <ChevronRight size={14} className="text-gray-600" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        <Link
          href={`/ratgeber/${slugPath}`}
          className="flex-1 text-sm text-gray-600 hover:text-gray-900"
          onClick={onLinkClick}
        >
          {category.name}
        </Link>
      </h4>

      {hasChildren && isOpen && (
        <>
          {category.children!.map(child => (
            <CategoryTreeNode key={child.id} category={child} level={level + 1} onLinkClick={onLinkClick} ancestorPath={slugPath} />
          ))}
        </>
      )}
    </li>
  )
}
