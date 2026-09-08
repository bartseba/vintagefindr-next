'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { clsx } from 'clsx'
import Link from 'next/link'

interface HorizontalCarouselProps {
  title: string
  showAll?: string
  onShowAll?: () => void
  children: React.ReactNode
  gridClass?: string
}

export function HorizontalCarousel({ title, showAll, children, onShowAll, gridClass = "auto-cols-[minmax(183px,auto)] md:auto-cols-[minmax(300px,auto)] lg:auto-cols-[minmax(300px,auto)] gap-3 overflow-x-auto scrollbar-hide pb-2" }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    window.addEventListener('resize', checkScrollButtons)
    return () => window.removeEventListener('resize', checkScrollButtons)
  }, [children])

  const scrollLeft = () => {
    if (scrollRef.current) {
      const gap = 16 // gap-4
      const scrollAmount = scrollRef.current.clientWidth + gap
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const gap = 16 // gap-4
      const scrollAmount = scrollRef.current.clientWidth + gap
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }
  const setButton = (children as React.ReactNode[])?.length > 5;
  return (
    <div className="">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        {showAll && (
          <Link
            href={showAll}
            onClick={onShowAll}
            aria-label={`Alle ${title} anzeigen`}
            className="text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
          >
            Alle anzeigen
          </Link>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Scroll Buttons */}
        {setButton && (
          <>
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className={clsx(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-200',
            canScrollLeft
              ? 'opacity-100 hover:bg-gray-50'
              : 'opacity-0 cursor-not-allowed'
          )}
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <button
          onClick={scrollRight}
          disabled={!canScrollRight}
          className={clsx(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-200',
            canScrollRight
              ? 'opacity-100 hover:bg-gray-50'
              : 'opacity-0 cursor-not-allowed'
          )}
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
        </>
   )}
        {/* Content */}
        <div
          ref={scrollRef}
          onScroll={checkScrollButtons}
          className={`grid grid-flow-col ${(children as React.ReactNode[])?.length >= 5 ? gridClass : 'auto-cols-[fit-content(290px)] gap-4'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
