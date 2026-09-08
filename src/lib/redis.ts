import 'server-only'
import Redis from 'ioredis'

/**
 * Ported from app/lib/redis.server.ts. Railway automatically provides
 * REDIS_URL when a Redis service is attached to the project; falls back to
 * `null` (callers degrade to in-memory/fail-open behavior) when it isn't
 * configured, matching the original.
 */

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl || redisUrl === '') {
    console.warn(
      '⚠️  REDIS_URL not configured. Rate limiting will use in-memory fallback.\n' +
      'For production: Add Redis service in Railway Dashboard.'
    )
    return null
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: false,
    })

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err)
    })

    return redis
  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    return null
  }
}

/**
 * Rate limiting using Redis (fixed window).
 *
 * @param key - Unique identifier (e.g., user ID, IP, session hash)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns true if request is allowed, false if rate limit exceeded
 */
export async function checkRedisRateLimit(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<boolean> {
  const client = getRedisClient()

  if (!client) {
    console.warn('Redis not available, skipping rate limit for:', key)
    return true
  }

  try {
    const rateLimitKey = `ratelimit:${key}`
    const current = await client.incr(rateLimitKey)

    if (current === 1) {
      await client.expire(rateLimitKey, windowSeconds)
    }

    if (current > maxRequests) {
      console.log(`🚫 Rate limit exceeded for ${key}: ${current}/${maxRequests}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Redis rate limit check error:', error)
    return true
  }
}

/**
 * Sliding window rate limiting — more accurate than the fixed-window
 * version above, unused by any route ported so far but kept for parity
 * with the Remix original (`rateLimit.server.ts` callers may need it once
 * ported).
 */
export async function checkSlidingWindowRateLimit(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<boolean> {
  const client = getRedisClient()

  if (!client) {
    return true
  }

  try {
    const rateLimitKey = `ratelimit:sliding:${key}`
    const now = Date.now()
    const windowStart = now - (windowSeconds * 1000)

    const pipeline = client.pipeline()
    pipeline.zremrangebyscore(rateLimitKey, '-inf', windowStart)
    pipeline.zcard(rateLimitKey)
    pipeline.zadd(rateLimitKey, now, `${now}`)
    pipeline.expire(rateLimitKey, windowSeconds * 2)

    const results = await pipeline.exec()
    if (!results) return true

    const count = results[1][1] as number

    if (count >= maxRequests) {
      console.log(`🚫 Sliding window rate limit exceeded for ${key}: ${count}/${maxRequests}`)
      return false
    }

    return true
  } catch (error) {
    console.error('Redis sliding window rate limit error:', error)
    return true
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    console.log('Redis connection closed')
  }
}
