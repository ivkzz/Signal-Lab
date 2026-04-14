'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getUserFacingErrorMessage } from '@/lib/error-message'
import {
  DashboardHealthLive,
  DashboardHeader,
  DashboardMetrics,
  DashboardRunsErrorBanner,
  HistoryCard,
  ScenarioFormCard,
  WorkspaceTabStrip,
  healthStateClass,
  type ScenarioFormValues,
  type ScenarioRun,
  type WorkspaceTab,
} from '@/components/dashboard'
import { countRunsByStatus, formatKpiValue } from '@/lib/dashboard-metrics'
import { getObservabilityLinks } from '@/lib/observability-urls'

export default function Home() {
  const queryClient = useQueryClient()
  const observability = useMemo(() => getObservabilityLinks(), [])
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('history')

  const form = useForm<ScenarioFormValues>({
    defaultValues: {
      type: 'success',
      name: '',
    },
  })

  const {
    data: health,
    isLoading: healthLoading,
    isError: healthIsError,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get('/health')
      return data as { status: string }
    },
    refetchInterval: 5000,
  })

  const {
    data: runs,
    isLoading: runsLoading,
    isError: runsIsError,
    error: runsError,
    refetch: refetchRuns,
    isSuccess: runsIsSuccess,
  } = useQuery({
    queryKey: ['scenario-runs'],
    queryFn: async () => {
      const { data } = await api.get('/scenarios')
      return data as ScenarioRun[]
    },
    refetchInterval: 7000,
  })

  const runScenario = useMutation({
    mutationFn: async (payload: ScenarioFormValues) => {
      const { data } = await api.post('/scenarios/run', payload)
      return data
    },
    onSuccess: async (_data, variables) => {
      toast.success('Scenario completed', {
        description: `Type: ${variables.type}`,
      })
      form.reset({ ...form.getValues(), name: '' })
      if (typeof window.matchMedia !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
        setWorkspaceTab('history')
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 418) {
        const body = error.response.data as { message?: string; signal?: number } | undefined
        toast.info("I'm a teapot", {
          description:
            typeof body?.message === 'string'
              ? `${body.message}${typeof body.signal === 'number' ? ` (signal ${body.signal})` : ''}`
              : 'HTTP 418 — run saved with easter metadata.',
        })
        return
      }
      toast.error('Scenario request failed', {
        description: getUserFacingErrorMessage(error),
      })
    },
    onSettled: async () => {
      // Запись в БД создаётся и при ошибке (system_error и др.) — всегда обновляем список.
      await queryClient.invalidateQueries({ queryKey: ['scenario-runs'] })
    },
  })

  const selectedType = useWatch({
    control: form.control,
    name: 'type',
    defaultValue: 'success',
  })

  const runsDataReady = runsIsSuccess && runs !== undefined
  const totalDisplay = formatKpiValue(runs?.length ?? 0, runsDataReady)
  const completedDisplay = formatKpiValue(countRunsByStatus(runs, 'completed'), runsDataReady)
  const failedDisplay = formatKpiValue(countRunsByStatus(runs, 'error'), runsDataReady)

  const healthClass = healthStateClass({
    isError: healthIsError,
    isLoading: healthLoading,
    status: health?.status,
  })

  const observabilityEntries = useMemo(
    () =>
      [
        { label: 'Grafana', href: observability.grafana },
        { label: 'Prometheus', href: observability.prometheus },
        { label: 'Metrics', href: observability.backendMetrics },
      ] as const,
    [observability],
  )

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <DashboardHealthLive healthClass={healthClass} />

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 md:gap-5 md:px-6 md:py-5">
        <DashboardHeader
          health={health}
          healthLoading={healthLoading}
          healthIsError={healthIsError}
          healthError={healthError}
          onRetryHealth={() => void refetchHealth()}
          observabilityEntries={observabilityEntries}
        />

        <DashboardMetrics
          totalDisplay={totalDisplay}
          completedDisplay={completedDisplay}
          failedDisplay={failedDisplay}
        />

        {runsIsError && <DashboardRunsErrorBanner error={runsError} onRetry={() => void refetchRuns()} />}

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:grid lg:min-h-0 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0">
          <WorkspaceTabStrip tab={workspaceTab} onChange={setWorkspaceTab} />

          <ScenarioFormCard
            className="lg:col-span-1"
            form={form}
            runScenario={runScenario}
            selectedType={selectedType}
            workspaceTab={workspaceTab}
          />

          <HistoryCard
            className="lg:col-span-2"
            runs={runs}
            runsLoading={runsLoading}
            runsIsError={runsIsError}
            runsIsSuccess={runsIsSuccess}
            workspaceTab={workspaceTab}
          />
        </div>
      </div>
    </main>
  )
}
