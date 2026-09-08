'use client'

import { liteClient as algoliasearch } from 'algoliasearch/lite'

/**
 * The Remix app instantiated two separate `liteClient`s (SearchClient.tsx +
 * SearchClientSSR.tsx) with hardcoded App ID / Search API key literals
 * instead of reading them from env vars. This consolidates to one shared
 * client reading the public env vars — a straight duplication/hardcoding
 * cleanup, not a behavior change.
 */
export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
)
