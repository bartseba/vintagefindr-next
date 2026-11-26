'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Trash2 } from 'lucide-react'

interface SavedSearchItem {
  id: string
  label: string
  result_path: string
  is_active: boolean
}

/** Dashboard section "Meine Such-Alerts": list and delete saved searches. */
export function SavedSearchesList() {
  const [items, setItems] = useState<SavedSearchItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/saved-searches')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) setItems(data.savedSearches ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('Such-Alerts konnten nicht geladen werden.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function remove(id: string) {
    const previous = items
    setItems((current) => current?.filter((item) => item.id !== id) ?? null)
    const res = await fetch(`/api/saved-searches?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null)
    if (!res?.ok) {
      setItems(previous)
      setError('Löschen hat nicht geklappt. Bitte versuch es noch mal.')
    }
  }

  return (
    <div id="such-alerts" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 scroll-mt-24">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-vintage-primary" aria-hidden />
        <h2 className="text-xl font-semibold text-gray-900">Meine Such-Alerts</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Neue Treffer für diese Suchen schicken wir dir einmal täglich per E-Mail.
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {items === null && !error && <p className="text-sm text-gray-500">Lade …</p>}

      {items && items.length === 0 && (
        <p className="text-sm text-gray-600">
          Noch keine Such-Alerts. Such nach einem Teil und klick auf „Such-Alert speichern“.
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <Link href={item.result_path} className="font-medium text-gray-900 hover:text-vintage-primary break-words">
                  {item.label}
                </Link>
                {!item.is_active && <span className="ml-2 text-xs text-gray-500">(abbestellt)</span>}
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="shrink-0 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                aria-label={`Such-Alert „${item.label}“ löschen`}
              >
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
