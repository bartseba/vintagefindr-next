import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { searchNewestForAlert } from '@/lib/algolia/search'
import { runSearchAlerts, sendViaResend } from '@/lib/searchAlerts'
import type { SavedSearchRow } from '@/lib/savedSearch'

/**
 * Daily saved-search digest, triggered by a Railway cron service:
 *   curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" "$SITE_URL/api/cron/saved-search-alerts"
 * `?dryRun=1` returns what would be sent without sending or updating anything.
 */
export const dynamic = 'force-dynamic'

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get('authorization') ?? ''
  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(header)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function siteUrl() {
  return (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://vintagefindr.de').replace(/\/$/, '')
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1'
  const supabase = createSupabaseAdminClient()

  try {
    const result = await runSearchAlerts(
      {
        siteUrl: siteUrl(),
        loadActiveSearches: async () => {
          const { data, error } = await supabase.from('saved_searches').select('*').eq('is_active', true)
          if (error) throw error
          return (data ?? []) as SavedSearchRow[]
        },
        getUserEmail: async (userId) => {
          const { data, error } = await supabase.auth.admin.getUserById(userId)
          if (error) return null
          return data.user?.email ?? null
        },
        searchNewest: (params) => searchNewestForAlert(params),
        sendEmail: sendViaResend,
        markNotified: async (ids, at) => {
          const { error } = await supabase.from('saved_searches').update({ last_notified_at: at }).in('id', ids)
          if (error) throw error
        },
      },
      { dryRun }
    )
    return NextResponse.json({ dryRun, ...result })
  } catch (err) {
    console.error('[search-alerts] run failed:', err)
    return NextResponse.json({ error: 'Run failed' }, { status: 500 })
  }
}
