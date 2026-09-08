'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, Clock, X, BookText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { searchClient } from '@/lib/algolia/client'
import { useTextStore } from '@/hooks/useTextStore'

interface AutocompleteSearchProps {
  placeholder?: string
  className?: string
  onCloseSearch?: () => void
}

interface RecentSearch {
  query: string
  timestamp: number
}

interface Suggestion {
  type: 'recent' | 'product' | 'ratgeber'
  title: string
  subtitle?: string
  image?: string
  slug?: string
  brand?: string
}

const RECENT_SEARCHES_KEY = 'vintagefinder-recent-searches'
const MAX_RECENT_SEARCHES = 5

export function AutocompleteSearch({
  placeholder = 'Suche nach Produkten oder Ratgeber...',
  className = '',
  onCloseSearch,
}: AutocompleteSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const setSearchQueryStore = useTextStore((state) => state.setSearchQuery)

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        const searches: RecentSearch[] = JSON.parse(stored)
        const queries = searches
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, MAX_RECENT_SEARCHES)
          .map(s => s.query)
        setRecentSearches(queries)
      }
    } catch (e) {
      console.error('Failed to load recent searches', e)
    }
  }

  const saveRecentSearch = (query: string) => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      let searches: RecentSearch[] = stored ? JSON.parse(stored) : []

      searches = searches.filter(s => s.query !== query)
      // eslint-disable-next-line react-hooks/purity -- only ever called from event handlers (search submit/click), never during render
      searches.unshift({ query, timestamp: Date.now() })
      searches = searches.slice(0, MAX_RECENT_SEARCHES)

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
      setRecentSearches(searches.map(s => s.query))
    } catch (e) {
      console.error('Failed to save recent search', e)
    }
  }

  const removeRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        let searches: RecentSearch[] = JSON.parse(stored)
        searches = searches.filter(s => s.query !== query)
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
        setRecentSearches(searches.map(s => s.query))
      }
    } catch (e) {
      console.error('Failed to remove recent search', e)
    }
  }

  const loadInitialSuggestions = async () => {
    const recentSuggestions: Suggestion[] = recentSearches.map(query => ({
      type: 'recent' as const,
      title: query,
    }))

    try {
      const { results } = await searchClient.searchForHits<{
        title: string
        excerpt?: string
        seo_description?: string
        slug: string
      }>({
        requests: [
          {
            indexName: 'ratgeber',
            query: '',
            hitsPerPage: 5,
            filters: 'status:published',
          },
        ],
      })
      const ratgeberHits = results[0]?.hits ?? []

      const nextSuggestions: Suggestion[] = [
        ...recentSuggestions,
        ...ratgeberHits.map((hit) => ({
          type: 'ratgeber' as const,
          title: hit.title,
          subtitle: hit.excerpt || hit.seo_description || '',
          slug: hit.slug,
        })),
      ]

      setSuggestions(nextSuggestions)
    } catch (error) {
      console.error('Failed to load initial suggestions', error)
      setSuggestions(recentSuggestions)
    }
  }

  const fetchSuggestions = async (query: string) => {
    const filteredRecent: Suggestion[] = recentSearches
      .filter(q => q.toLowerCase().includes(query.toLowerCase()))
      .map(q => ({
        type: 'recent' as const,
        title: q,
      }))

    try {
      const [productsResult, ratgeberResult] = await Promise.all([
        searchClient.searchForHits<{
          title: string
          brand?: string
          price: number
          currency: string
          size?: string
          image_url_1?: string
        }>({
          requests: [{ indexName: 'products', query, hitsPerPage: 5 }],
        }),
        searchClient.searchForHits<{
          title: string
          excerpt?: string
          seo_description?: string
          slug: string
        }>({
          requests: [{ indexName: 'ratgeber', query, hitsPerPage: 3 }],
        }),
      ])
      const productHits = productsResult.results[0]?.hits ?? []
      const ratgeberHits = ratgeberResult.results[0]?.hits ?? []

      const nextSuggestions: Suggestion[] = [
        ...productHits.map((hit) => ({
          type: 'product' as const,
          title: hit.title,
          brand: hit.brand,
          subtitle: `${hit.price} ${hit.currency}${hit.size ? ` • ${hit.size}` : ''}`,
          image: hit.image_url_1,
        })),
        ...ratgeberHits.map((hit) => ({
          type: 'ratgeber' as const,
          title: hit.title,
          subtitle: hit.excerpt || hit.seo_description || '',
          slug: hit.slug,
        })),
      ]
      setSuggestions(nextSuggestions)
    } catch (error) {
      console.error('Failed to fetch suggestions', error)
      setSuggestions(filteredRecent)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from localStorage on mount, ported as-is from the working Remix component
    loadRecentSearches()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Only fetch suggestions when dropdown is open
    if (!isOpen) return

    if (searchQuery.trim().length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches suggestions on query change, ported as-is from the working Remix component
      fetchSuggestions(searchQuery)
    } else {
      loadInitialSuggestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ported from Remix as-is
  }, [searchQuery, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchQueryStore(searchQuery.trim())
      performSearch(searchQuery.trim())
      onCloseSearch?.()
    }
  }

  const performSearch = (query: string) => {
    saveRecentSearch(query)
    setIsOpen(false)
    router.push(`/vintage?q=${encodeURIComponent(query)}`)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'recent') {
      performSearch(suggestion.title)
    } else if (suggestion.type === 'ratgeber' && suggestion.slug) {
      setIsOpen(false)
      router.push(`/ratgeber/${suggestion.slug}`)
    } else if (suggestion.type === 'product') {
      performSearch(suggestion.title)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <Search className="h-5 w-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-[60px] border-[#EAEAEA] border-2 border-solid roboto-mono-vintage font-medium w-full bg-vintage-lightGray pl-10 pr-6 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:border-vintage-primary"
        />
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#EAEAEA] rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50">
          {suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              {searchQuery ? 'Keine Ergebnisse gefunden' : 'Beginne mit der Suche...'}
            </div>
          )}

          {recentSearches.length > 0 && searchQuery.length === 0 && suggestions.length > 0 && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide  vintage-search-title">
                Letzte Suchen
              </div>
          )}

          {suggestions.map((suggestion, index, array) => {
            const isFirstProduct = suggestion.type === 'product' && (index === 0 || array[index - 1].type !== 'product')
            const isFirstRatgeber = suggestion.type === 'ratgeber' && (index === 0 || array[index - 1].type !== 'ratgeber')

            return (
              <div key={index}>
                {isFirstProduct && searchQuery.length > 0 && (

                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide vintage-search-title">
                      Produkte
                  </div>
                )}
                {isFirstRatgeber && searchQuery.length > 0 && (

                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide  vintage-search-title">
                      Ratgeber
                    </div>
                )}
                <div
                  onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
            >
              {suggestion.type === 'recent' && (
                <>
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 text-sm">{suggestion.title}</span>
                  <button
                    onClick={(e) => removeRecentSearch(suggestion.title, e)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                </>
              )}

              {suggestion.type === 'product' && (
                <>
                  {suggestion.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- external Directus/Bunny image hosts, next/image adoption deferred (see migration plan problem #7)
                    <img
                      src={suggestion.image}
                      alt={suggestion.title}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {suggestion.brand && <span className="font-bold">{suggestion.brand} - </span>}
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500 truncate">{suggestion.subtitle}</div>
                    )}
                  </div>
                </>
              )}

              {suggestion.type === 'ratgeber' && (
                <>
                  <BookText className="h-4 w-4 text-vintage-secondary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{suggestion.title}</div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500 line-clamp-2">{suggestion.subtitle}</div>
                    )}
                  </div>
                </>
              )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
