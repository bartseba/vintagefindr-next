import { NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase/public'
import { getRedisClient } from '@/lib/redis'

type CheckStatus = 'ok' | 'error' | 'not_configured'

export async function GET() {
  const checks: Record<string, CheckStatus> = {
    api: 'ok',
    database: 'not_configured',
    redis: 'not_configured',
  }

  // Check Supabase connection using RPC function
  if (supabasePublic) {
    try {
      const { data, error } = await supabasePublic.rpc('health_check')
      checks.database = (error || !data) ? 'error' : 'ok'
    } catch {
      checks.database = 'error'
    }
  }

  // Check Redis connection
  const redis = getRedisClient()
  if (redis) {
    try {
      await redis.ping()
      checks.redis = 'ok'
    } catch {
      checks.redis = 'error'
    }
  }

  const allOk = Object.values(checks).every((v) => v === 'ok' || v === 'not_configured')

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  )
}
