import { QueryClient } from '@tanstack/react-query'

/**
 * Create a new QueryClient instance
 *
 * Ported unchanged from the Remix app (app/lib/queryClient.ts) — this logic
 * is framework-agnostic.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

export const queryKeys = {
  favorites: {
    all: ['favorites'] as const,
    list: () => [...queryKeys.favorites.all, 'list'] as const,
    detail: (productId: string) => [...queryKeys.favorites.all, 'detail', productId] as const,
  },
  collections: {
    all: ['collections'] as const,
    list: () => [...queryKeys.collections.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.collections.all, 'detail', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.products.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    vendor: (vendorId: string) => [...queryKeys.products.all, 'vendor', vendorId] as const,
  },
  vendor: {
    all: ['vendor'] as const,
    dashboard: () => [...queryKeys.vendor.all, 'dashboard'] as const,
    analytics: (period?: string) => [...queryKeys.vendor.all, 'analytics', period] as const,
    products: (filters?: Record<string, unknown>) => [...queryKeys.vendor.all, 'products', filters] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },
  extensionRequests: {
    all: ['extensionRequests'] as const,
    list: (status?: string) => [...queryKeys.extensionRequests.all, 'list', status] as const,
  },
} as const
