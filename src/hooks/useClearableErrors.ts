'use client'

import { useCallback, useState, type FormEvent } from 'react'

type FieldErrors = Record<string, string> | undefined

/**
 * Server-side validation errors that disappear per field as soon as the
 * vendor edits that field, instead of lingering until the next submit.
 * A new result from the server (a new `serverErrors` object) shows all of
 * its errors again.
 *
 * - `onInput` goes on the <form>: native inputs/textareas/selects bubble
 *   their input events and are matched by their `name`.
 * - `clearError(name)` is for custom controls that only update a hidden
 *   input (searchable selects, image uploads), which fire no input event.
 */
export function useClearableErrors(serverErrors: FieldErrors) {
  const [source, setSource] = useState<FieldErrors>(serverErrors)
  const [cleared, setCleared] = useState<ReadonlySet<string>>(() => new Set())

  // Reset during render when the server returns a new result (React's
  // recommended alternative to syncing state in an effect).
  if (source !== serverErrors) {
    setSource(serverErrors)
    setCleared(new Set())
  }

  const clearError = useCallback((name: string) => {
    setCleared((prev) => (prev.has(name) ? prev : new Set(prev).add(name)))
  }, [])

  const onInput = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      const target = event.target as { name?: unknown }
      if (typeof target.name === 'string' && target.name) clearError(target.name)
    },
    [clearError]
  )

  const errors = serverErrors
    ? Object.fromEntries(Object.entries(serverErrors).filter(([key]) => !cleared.has(key)))
    : undefined

  return { errors, clearError, onInput }
}
