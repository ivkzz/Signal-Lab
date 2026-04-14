'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { THEME_STORAGE_KEY } from '@/lib/theme'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey={THEME_STORAGE_KEY}>
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
