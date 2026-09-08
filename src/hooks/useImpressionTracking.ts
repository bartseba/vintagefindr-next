'use client'

import { useEffect, useRef } from 'react'

/**
 * DSGVO-compliant impression tracking hook
 *
 * This hook tracks product impressions without storing any personal data.
 * It uses a client-generated session hash that is not linked to any user identity.
 */

function getSessionHash(): string {
  const SESSION_KEY = 'vf_session'

  let sessionHash = sessionStorage.getItem(SESSION_KEY)

  if (!sessionHash) {
    sessionHash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    sessionStorage.setItem(SESSION_KEY, sessionHash)
  }

  return sessionHash
}

interface UseImpressionTrackingOptions {
  productId: string
  vendorId: string
  pageType?: 'search' | 'category' | 'product_detail' | 'homepage'
  enabled?: boolean
  threshold?: number
  minViewTime?: number
}

export function useImpressionTracking({
  productId,
  vendorId,
  pageType = 'search',
  enabled = true,
  threshold = 0.5,
  minViewTime = 1000
}: UseImpressionTrackingOptions) {
  const hasTracked = useRef(false)
  const viewStartTime = useRef<number | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled || hasTracked.current) {
      return
    }

    const trackImpression = async () => {
      try {
        const sessionHash = getSessionHash()

        let referrerType = 'direct'
        if (document.referrer) {
          const referrerUrl = new URL(document.referrer)
          const currentUrl = new URL(window.location.href)

          if (referrerUrl.hostname !== currentUrl.hostname) {
            if (referrerUrl.hostname.includes('google')) {
              referrerType = 'search'
            } else if (referrerUrl.hostname.match(/facebook|instagram|twitter|linkedin|tiktok/)) {
              referrerType = 'social'
            } else {
              referrerType = 'external'
            }
          } else {
            referrerType = 'internal'
          }
        }

        await fetch('/api/track-impression', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            vendorId,
            sessionHash,
            pageType,
            referrerType
          }),
        })

        hasTracked.current = true
      } catch (error) {
        console.debug('Impression tracking failed:', error)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!viewStartTime.current) {
              viewStartTime.current = Date.now()
            }

            const checkViewTime = () => {
              if (viewStartTime.current &&
                  Date.now() - viewStartTime.current >= minViewTime &&
                  !hasTracked.current) {
                trackImpression()
              }
            }

            setTimeout(checkViewTime, minViewTime)
          } else {
            viewStartTime.current = null
          }
        })
      },
      {
        threshold: threshold,
        rootMargin: '0px'
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [productId, vendorId, pageType, enabled, threshold, minViewTime])

  return elementRef
}
