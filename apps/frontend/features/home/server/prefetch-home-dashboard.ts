import 'server-only'

import { QueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from '@/features/home/query-keys'
import { fetchInitialHealth, fetchInitialScenarioRuns } from '@/lib/server-api'

/** Совпадает с `defaultOptions.queries` в `components/providers/app-providers.tsx`. */
const queryClientDefaults = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
} as const

export function makeHomeServerQueryClient() {
  return new QueryClient(queryClientDefaults)
}

export async function prefetchHomeDashboard(queryClient: QueryClient) {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.health,
      queryFn: async () => {
        const r = await fetchInitialHealth()
        if (!r.ok) throw new Error('health_unavailable')
        return r.data
      },
    }),
    queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.scenarioRuns,
      queryFn: async () => {
        const r = await fetchInitialScenarioRuns()
        if (!r.ok) throw new Error('runs_unavailable')
        return r.data
      },
    }),
  ])
}
