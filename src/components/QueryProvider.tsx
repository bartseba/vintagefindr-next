'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { createQueryClient } from '@/lib/queryClient'

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * Creates a new QueryClient per component instance so SSR requests don't
 * share cached data between different users.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
