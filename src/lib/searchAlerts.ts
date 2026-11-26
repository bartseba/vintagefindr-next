import 'server-only'
import { pickNewHits, toAlgoliaParams, type AlertHit, type SavedSearchRow } from '@/lib/savedSearch'
import { buildSearchAlertEmail, type AlertEmailSection } from '@/lib/email/searchAlertEmail'

/**
 * Daily saved-search digest. Dependencies are injected so the run can be
 * unit-tested without Supabase, Algolia or Resend.
 */
export interface SearchAlertDeps {
  loadActiveSearches: () => Promise<SavedSearchRow[]>
  getUserEmail: (userId: string) => Promise<string | null>
  searchNewest: (params: ReturnType<typeof toAlgoliaParams>) => Promise<AlertHit[]>
  sendEmail: (mail: { to: string; subject: string; html: string; text: string; unsubscribeUrl: string }) => Promise<void>
  markNotified: (searchIds: string[], at: string) => Promise<void>
  siteUrl: string
  now?: () => Date
}

export interface SearchAlertRunResult {
  searches: number
  usersEmailed: number
  searchesWithNewHits: number
  failures: { userId: string; reason: string }[]
  /** Filled in dry runs: what would have been sent. */
  preview: { userId: string; to: string | null; subject: string; searches: { id: string; label: string; hits: string[] }[] }[]
}

export async function runSearchAlerts(deps: SearchAlertDeps, { dryRun = false } = {}): Promise<SearchAlertRunResult> {
  const startedAt = (deps.now?.() ?? new Date()).toISOString()
  const searches = await deps.loadActiveSearches()
  const result: SearchAlertRunResult = { searches: searches.length, usersEmailed: 0, searchesWithNewHits: 0, failures: [], preview: [] }

  const byUser = new Map<string, { search: SavedSearchRow; hits: AlertHit[] }[]>()
  for (const search of searches) {
    let hits: AlertHit[]
    try {
      hits = pickNewHits(await deps.searchNewest(toAlgoliaParams(search)), search.last_notified_at)
    } catch (err) {
      // Search failure: skip this search this round, keep last_notified_at so
      // nothing is lost - it is picked up again tomorrow.
      console.error(`[search-alerts] search ${search.id} failed:`, err)
      continue
    }
    if (!hits.length) continue
    result.searchesWithNewHits++
    const list = byUser.get(search.user_id) ?? []
    list.push({ search, hits })
    byUser.set(search.user_id, list)
  }

  for (const [userId, entries] of byUser) {
    const sections: AlertEmailSection[] = entries.map(({ search, hits }) => ({
      label: search.label,
      resultUrl: `${deps.siteUrl}${search.result_path}`,
      unsubscribeUrl: `${deps.siteUrl}/api/saved-searches/unsubscribe?token=${encodeURIComponent(search.unsubscribe_token)}`,
      hits,
    }))
    const email = buildSearchAlertEmail(sections, deps.siteUrl)
    const to = await deps.getUserEmail(userId)

    if (dryRun) {
      result.preview.push({
        userId,
        to,
        subject: email.subject,
        searches: entries.map(({ search, hits }) => ({ id: search.id, label: search.label, hits: hits.map((h) => h.title ?? h.objectID) })),
      })
      continue
    }

    if (!to) {
      result.failures.push({ userId, reason: 'no email' })
      continue
    }
    try {
      await deps.sendEmail({ to, subject: email.subject, html: email.html, text: email.text, unsubscribeUrl: sections[0].unsubscribeUrl })
      await deps.markNotified(entries.map((e) => e.search.id), startedAt)
      result.usersEmailed++
    } catch (err) {
      console.error(`[search-alerts] sending to user ${userId} failed:`, err)
      result.failures.push({ userId, reason: err instanceof Error ? err.message : 'send failed' })
    }
  }

  return result
}

/** Resend REST API, no SDK dependency. */
export async function sendViaResend(mail: { to: string; subject: string; html: string; text: string; unsubscribeUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ALERT_FROM_EMAIL
  if (!apiKey || !from) throw new Error('RESEND_API_KEY or ALERT_FROM_EMAIL missing')
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: {
        'List-Unsubscribe': `<${mail.unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  })
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 200)}`)
  }
}
