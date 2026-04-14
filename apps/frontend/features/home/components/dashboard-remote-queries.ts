'use client'

import type { HealthPayload, ScenarioRun } from '@/features/home/types'
import api from '@/lib/api'
import { dashboardQueryKeys } from '@/lib/dashboard-query-keys'

/** Опции удалённого `GET /health` (разделяйте в `useQuery`). */
export const dashboardHealthRemoteQuery = {
  queryKey: dashboardQueryKeys.health,
  queryFn: async (): Promise<HealthPayload> => {
    const { data } = await api.get('/health')
    return data as HealthPayload
  },
  refetchInterval: 5000,
} as const

/** Опции удалённого `GET /scenarios` (разделяйте в `useQuery`). */
export const dashboardScenarioRunsRemoteQuery = {
  queryKey: dashboardQueryKeys.scenarioRuns,
  queryFn: async (): Promise<ScenarioRun[]> => {
    const { data } = await api.get('/scenarios')
    return data as ScenarioRun[]
  },
  refetchInterval: 7000,
} as const
