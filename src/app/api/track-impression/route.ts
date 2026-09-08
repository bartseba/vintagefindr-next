import { NextResponse, type NextRequest } from 'next/server'
import { supabasePublic } from '@/lib/supabase/public'
import { checkRedisRateLimit } from '@/lib/redis'

/**
 * Ported from app/routes/api.track-impression.tsx. DSGVO-compliant
 * anonymous impression tracking — no PII stored, 90-day retention handled
 * server-side by the `track_product_impression` RPC. Was previously an
 * unimplemented endpoint here, so `useImpressionTracking` (already live on
 * every `ProductCard`) has been silently 404ing since sub-phase 2.1; this
 * makes that tracking actually work.
 *
 * Security measures:
 * - Rate limiting via Redis (falls back to in-memory below when Redis
 *   isn't configured, e.g. local development)
 * - Duplicate detection (5-minute window, handled inside the RPC)
 * - No PII stored — anonymous session hashes only
 */

// Fallback in-memory rate limiter for when Redis isn't configured
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkInMemoryRateLimit(sessionHash: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const limit = rateLimiter.get(sessionHash)

  if (!limit || now > limit.resetAt) {
    rateLimiter.set(sessionHash, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (limit.count >= maxRequests) {
    return false
  }

  limit.count++
  return true
}

// Clean up old rate limit entries periodically (in-memory fallback only)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimiter.entries()) {
    if (now > value.resetAt) {
      rateLimiter.delete(key)
    }
  }
}, 60000)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, vendorId, sessionHash, pageType, referrerType } = body

    if (!productId || !vendorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (sessionHash) {
      const isAllowed = await checkRedisRateLimit(sessionHash, 100, 60)

      if (!isAllowed) {
        const inMemoryAllowed = checkInMemoryRateLimit(sessionHash)
        if (!inMemoryAllowed) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }
      }
    }

    if (!supabasePublic) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const { data: trackResult, error } = await supabasePublic.rpc('track_product_impression', {
      p_product_id: productId,
      p_vendor_id: vendorId,
      p_session_hash: sessionHash || null,
      p_page_type: pageType || 'search',
      p_referrer_type: referrerType || 'direct',
    })

    if (error) {
      console.error('Impression tracking error:', error)
      return NextResponse.json({ error: 'Failed to track impression' }, { status: 500 })
    }

    return NextResponse.json({
      success: trackResult?.success || true,
      duplicate: trackResult?.duplicate || false,
    })
  } catch (error) {
    console.error('Impression tracking error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
