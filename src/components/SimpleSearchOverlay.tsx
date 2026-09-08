'use client'

import { useEffect, useRef } from 'react'
import { AutocompleteSearch } from './AutocompleteSearch'

interface SimpleSearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SimpleSearchOverlay({ isOpen, onClose }: SimpleSearchOverlayProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return
    const onClick = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [isOpen, onClose])

  const handleSearch = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-vintage-secondary/50 xl:hidden">
      <div ref={contentRef} className="flex flex-col">
        <div className="sticky top-0 p-4">
          <div className="flex-1 relative z-[90] h-[70px] content-center">
            <AutocompleteSearch
              placeholder="Suche nach Vintage-Pieces oder Marke, Kategorie..."
              className="w-full"
              onCloseSearch={handleSearch}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-gray-500 text-center mt-8">
            Gib einen Suchbegriff ein, um Produkte zu finden
          </div>
        </div>
      </div>
    </div>
  )
}
