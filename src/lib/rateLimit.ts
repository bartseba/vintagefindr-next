import 'server-only'
import { NextResponse } from 'next/server'
import { checkSlidingWindowRateLimit } from './redis'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}

/**
 * Ported from app/lib/rateLimit.server.ts. Predefined rate limits for
 * different use cases.
 */
export const RATE_LIMITS = {
  /** Auth-sensitive routes: 10 requests per minute */
  strict: { windowMs: 60000, maxRequests: 10 },
  /** Standard user actions: 60 requests per minute */
  standard: { windowMs: 60000, maxRequests: 60 },
  /** High-traffic public endpoints: 200 requests per minute */
  relaxed: { windowMs: 60000, maxRequests: 200 },
  /** Cron/system jobs: 5 requests per minute */
  cron: { windowMs: 60000, maxRequests: 5 },
} as const

const inMemoryLimiter = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of inMemoryLimiter.entries()) {
    if (now > value.resetAt) {
      inMemoryLimiter.delete(key)
    }
  }
}, 60000)

function checkInMemoryRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const limit = inMemoryLimiter.get(key)

  if (!limit || now > limit.resetAt) {
    inMemoryLimiter.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (limit.count >= maxRequests) {
    return false
  }

  limit.count++
  return true
}

function getRateLimitKey(request: Request, prefix: string): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  let identifier = 'unknown'

  if (cfConnectingIp) {
    identifier = cfConnectingIp
  } else if (forwardedFor) {
    identifier = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    identifier = realIp
  }

  return `${prefix}:${identifier}`
}

/**
 * Rate limit middleware for Route Handlers. Returns null if the request is
 * allowed, or a 429 NextResponse if rate limited.
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig = RATE_LIMITS.standard,
  routeKey?: string
): Promise<Response | null> {
  const prefix = routeKey || config.keyPrefix || 'api'
  const key = getRateLimitKey(request, prefix)
  const windowSeconds = Math.ceil(config.windowMs / 1000)

  const inMemoryAllowed = checkInMemoryRateLimit(key, config.maxRequests, config.windowMs)
  const redisAllowed = await checkSlidingWindowRateLimit(key, config.maxRequests, windowSeconds)

  if (!inMemoryAllowed || !redisAllowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfter: windowSeconds },
      {
        status: 429,
        headers: {
          'Retry-After': String(windowSeconds),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + windowSeconds),
        },
      }
    )
  }

  return null
}
