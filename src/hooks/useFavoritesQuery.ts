'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { queryKeys } from '@/lib/queryClient'

export interface FavoriteProduct {
  id: string
  title: string
  brand?: string
  price: number
  currency: string
  imageUrl?: string
  vendorName: string
  productUrl?: string
}

interface FavoritesResponse {
  favorites: FavoriteProduct[]
  user: { id: string } | null
}

interface FavoriteActionResponse {
  success: boolean
  action?: 'added' | 'removed'
  error?: string
  product?: FavoriteProduct
}

async function fetchFavorites(): Promise<FavoriteProduct[]> {
  const response = await fetch('/api/favorites')

  if (!response.ok) {
    throw new Error('Failed to fetch favorites')
  }

  const data: FavoritesResponse = await response.json()
  return data.favorites || []
}

async function toggleFavorite(
  productId: string,
  _product?: FavoriteProduct
): Promise<FavoriteActionResponse> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, _action: 'toggle' }),
  })

  if (!response.ok) {
    throw new Error('Failed to toggle favorite')
  }

  return response.json()
}

async function addFavorite(product: FavoriteProduct): Promise<FavoriteActionResponse> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: product.id, _action: 'add' }),
  })

  if (!response.ok) {
    throw new Error('Failed to add favorite')
  }

  return response.json()
}

async function removeFavorite(productId: string): Promise<FavoriteActionResponse> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, _action: 'remove' }),
  })

  if (!response.ok) {
    throw new Error('Failed to remove favorite')
  }

  return response.json()
}

interface UseFavoritesQueryOptions {
  isAuthenticated?: boolean
  initialData?: FavoriteProduct[]
}

/**
 * Ported unchanged from the Remix app (app/hooks/useFavoritesQuery.ts) —
 * pure fetch + React Query, zero Remix-specific dependencies.
 */
export function useFavoritesQuery({
  isAuthenticated = false,
  initialData,
}: UseFavoritesQueryOptions = {}) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
    initialData,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const toggleMutation = useMutation({
    mutationFn: ({ productId, product }: { productId: string; product?: FavoriteProduct }) =>
      toggleFavorite(productId, product),
    onMutate: async ({ productId, product }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.list() })

      const previousFavorites = queryClient.getQueryData<FavoriteProduct[]>(
        queryKeys.favorites.list()
      )

      queryClient.setQueryData<FavoriteProduct[]>(queryKeys.favorites.list(), (old = []) => {
        const exists = old.some((f) => f.id === productId)
        if (exists) {
          return old.filter((f) => f.id !== productId)
        } else if (product) {
          return [...old, product]
        }
        return old
      })

      if (typeof window !== 'undefined') {
        const exists = previousFavorites?.some((f) => f.id === productId)
        window.dispatchEvent(
          new CustomEvent('favoriteUpdate', {
            detail: {
              productId,
              action: exists ? 'remove' : 'add',
              product,
            },
          })
        )
      }

      return { previousFavorites }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.list(), context.previousFavorites)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() })
    },
  })

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.list() })
      const previousFavorites = queryClient.getQueryData<FavoriteProduct[]>(
        queryKeys.favorites.list()
      )

      queryClient.setQueryData<FavoriteProduct[]>(queryKeys.favorites.list(), (old = []) => {
        if (old.some((f) => f.id === product.id)) return old
        return [...old, product]
      })

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('favoriteUpdate', {
            detail: { productId: product.id, action: 'add', product },
          })
        )
      }

      return { previousFavorites }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.list(), context.previousFavorites)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.list() })
      const previousFavorites = queryClient.getQueryData<FavoriteProduct[]>(
        queryKeys.favorites.list()
      )

      queryClient.setQueryData<FavoriteProduct[]>(queryKeys.favorites.list(), (old = []) =>
        old.filter((f) => f.id !== productId)
      )

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('favoriteUpdate', {
            detail: { productId, action: 'remove' },
          })
        )
      }

      return { previousFavorites }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites.list(), context.previousFavorites)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() })
    },
  })

  const isFavorited = useCallback(
    (productId: string): boolean => {
      return query.data?.some((f) => f.id === productId) || false
    },
    [query.data]
  )

  const toggleFavoriteAction = useCallback(
    async (product: FavoriteProduct) => {
      toggleMutation.mutate({ productId: product.id, product })
    },
    [toggleMutation]
  )

  const addFavoriteAction = useCallback(
    async (product: FavoriteProduct) => {
      addMutation.mutate(product)
    },
    [addMutation]
  )

  const removeFavoriteAction = useCallback(
    async (productId: string) => {
      removeMutation.mutate(productId)
    },
    [removeMutation]
  )

  const setFavorites = useCallback(
    (favorites: FavoriteProduct[]) => {
      queryClient.setQueryData(queryKeys.favorites.list(), favorites)
    },
    [queryClient]
  )

  const loadFavorites = useCallback(
    async (_userId?: string) => {
      await query.refetch()
    },
    [query]
  )

  return {
    favorites: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    favoriteCount: query.data?.length || 0,

    isFavorited,

    toggleFavorite: toggleFavoriteAction,
    addFavorite: addFavoriteAction,
    removeFavorite: removeFavoriteAction,
    setFavorites,
    loadFavorites,
    clearError: () => {},

    toggleFavoriteMutation: toggleMutation,
    addFavoriteMutation: addMutation,
    removeFavoriteMutation: removeMutation,

    isToggling: toggleMutation.isPending,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,

    refetch: query.refetch,
  }
}
