'use client'

import { liteClient as algoliasearch } from 'algoliasearch/lite'

/**
 * The Remix app instantiated two separate `liteClient`s (SearchClient.tsx +
 * SearchClientSSR.tsx) with hardcoded App ID / Search API key literals
 * instead of reading them from env vars. This consolidates to one shared
 * client reading the public env vars — a straight duplication/hardcoding
 * cleanup, not a behavior change.
 *
 * `NEXT_PUBLIC_*` values are inlined into the browser bundle at build
 * time. On platforms (e.g. Railway) where env vars are only injected at
 * container runtime, not during `next build`, these come back `undefined`
 * — passing that straight into `algoliasearch()` throws synchronously
 * ("`appId` is missing.") and crashes the whole page on load. Falling
 * back to a non-empty placeholder keeps client construction safe; actual
 * search calls then just fail at the network level (already handled by
 * the try/catch in every caller / InstantSearch's own error state)
 * instead of crashing module evaluation.
 */
export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'missing-app-id',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || 'missing-api-key'
)
