'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleTextProps {
  children: React.ReactNode
  collapsedHeight?: number
  className?: string
}

/**
 * Clips `children` to `collapsedHeight` via CSS `max-height` (never removes
 * them from the DOM), fading the cut-off with a gradient and revealing the
 * rest via a "Weiterlesen" toggle. The full content is always present in
 * the server-rendered HTML — only the visual clipping is client-side — so
 * crawlers see the complete text regardless of JS execution (Google has
 * indexed CSS-hidden accordion/tab content at full weight since 2019).
 */
export function CollapsibleText({ children, collapsedHeight = 420, className = '' }: CollapsibleTextProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const checkOverflow = () => setIsOverflowing(el.scrollHeight > collapsedHeight)
    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)
    return () => observer.disconnect()
  }, [collapsedHeight])

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? undefined : `${collapsedHeight}px` }}
      >
        {children}
        {isOverflowing && !isOpen && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {isOverflowing && (
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-vintage-primary hover:underline"
        >
          {isOpen ? 'Weniger anzeigen' : 'Weiterlesen'}
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  )
}
