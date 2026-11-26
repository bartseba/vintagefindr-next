'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useInstantSearch } from 'react-instantsearch'
import { Bell, BellRing } from 'lucide-react'
import { fromUiState, isSavable, type IndexUiStateLike } from '@/lib/savedSearch'

interface SaveSearchButtonProps {
  /** Algolia `filters` the page is scoped to (category hub pages). */
  baseFilters?: string
  /** Algolia `facetFilters` the page is scoped to (brand pages). */
  baseFacetFilters?: string[][]
  /** Page title, used in the alert label (e.g. "Vintage Jacken"). */
  pageLabel?: string
}

type Status = 'idle' | 'saving' | 'saved' | 'error'

/**
 * "Such-Alert speichern": stores the current query + refinements so the
 * daily digest (`/api/cron/saved-search-alerts`) can email new matches.
 * Logged-out users are sent to the existing `?modal=login` flow.
 */
export function SaveSearchButton({ baseFilters, baseFacetFilters, pageLabel }: SaveSearchButtonProps) {
  const { indexUiState } = useInstantSearch()
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const state = indexUiState as IndexUiStateLike
  const context = { baseFilters, baseFacetFilters }
  if (!isSavable(state, context)) return null

  async function save() {
    setStatus('saving')
    setMessage(null)
    const resultPath = `${window.location.pathname}${window.location.search}`
    const payload = fromUiState(state, { ...context, resultPath, pageLabel })
    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        const params = new URLSearchParams(window.location.search)
        params.set('modal', 'login')
        router.push(`${pathname}?${params.toString()}`)
        setStatus('idle')
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Speichern hat nicht geklappt. Bitte versuch es noch mal.')
        return
      }
      setStatus('saved')
      setMessage(
        data.alreadySaved
          ? 'Diese Suche hast du schon gespeichert.'
          : 'Gespeichert. Neue Treffer schicken wir dir einmal täglich per E-Mail.'
      )
    } catch {
      setStatus('error')
      setMessage('Speichern hat nicht geklappt. Bitte versuch es noch mal.')
    }
  }

  const saved = status === 'saved'
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <button
        type="button"
        onClick={save}
        disabled={status === 'saving' || saved}
        className="inline-flex items-center gap-2 rounded-md border border-vintage-primary px-3 py-2 text-sm font-medium text-vintage-primary transition-colors hover:bg-vintage-primary hover:text-white disabled:cursor-default disabled:opacity-80 disabled:hover:bg-transparent disabled:hover:text-vintage-primary"
      >
        {saved ? <BellRing size={16} aria-hidden /> : <Bell size={16} aria-hidden />}
        {saved ? 'Such-Alert aktiv' : status === 'saving' ? 'Speichere …' : 'Such-Alert speichern'}
      </button>
      {message && (
        <p role="status" className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
