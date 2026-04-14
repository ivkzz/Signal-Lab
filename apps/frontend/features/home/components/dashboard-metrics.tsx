'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { DashboardRunsErrorBanner } from './dashboard-runs-error-banner'
import { dashboardScenarioRunsRemoteQuery } from './dashboard-remote-queries'
import { countRunsByStatus, formatKpiValue } from '@/features/home/metrics'
import { cn } from '@/lib/utils'

type DashboardMetricsProps = {
  className?: string
}

export function DashboardMetrics({ className }: DashboardMetricsProps) {
  const { data: runs, isError: runsIsError, error: runsError, refetch: refetchRuns, isSuccess: runsIsSuccess } =
    useQuery(dashboardScenarioRunsRemoteQuery)

  const runsDataReady = runsIsSuccess && runs !== undefined
  const totalDisplay = formatKpiValue(runs?.length ?? 0, runsDataReady)
  const completedDisplay = formatKpiValue(countRunsByStatus(runs, 'completed'), runsDataReady)
  const failedDisplay = formatKpiValue(countRunsByStatus(runs, 'error'), runsDataReady)

  return (
    <div className={cn('shrink-0 space-y-2', className)}>
      {runsIsError && <DashboardRunsErrorBanner error={runsError} onRetry={() => void refetchRuns()} />}

      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Overview
        </h2>
        <div className="grid min-w-0 grid-cols-3 gap-4 lg:gap-6">
          <Card className="flex min-h-0 flex-col p-3 sm:p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">Recent</p>
            <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-foreground sm:mt-2 sm:text-2xl">{totalDisplay}</p>
          </Card>
          <Card className="flex min-h-0 flex-col p-3 sm:p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">Done</p>
            <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-success sm:mt-2 sm:text-2xl">{completedDisplay}</p>
          </Card>
          <Card className="flex min-h-0 flex-col p-3 sm:p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">Failed</p>
            <p className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-muted-foreground/80 sm:text-[10px]">
              status error
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-destructive sm:mt-1.5 sm:text-2xl">
              {failedDisplay}
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
