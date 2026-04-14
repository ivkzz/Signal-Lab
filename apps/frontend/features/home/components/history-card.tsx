'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardScenarioRunsRemoteQuery } from './dashboard-remote-queries'
import { formatDuration, statusVariant } from '@/features/home/utils'
import { cn } from '@/lib/utils'

type HistoryCardProps = {
  workspaceTab: 'form' | 'history'
  className?: string
}

export function HistoryCard({ workspaceTab, className }: HistoryCardProps) {
  const { data: runs, isLoading: runsLoading, isError: runsIsError, isSuccess: runsIsSuccess } = useQuery(
    dashboardScenarioRunsRemoteQuery,
  )

  return (
    <Card
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0 lg:min-h-0',
        workspaceTab !== 'history' && 'max-lg:hidden',
        className,
      )}
    >
      <CardHeader className="mb-0 shrink-0 border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
        <CardTitle>History</CardTitle>
        <CardDescription className="mt-1 normal-case tracking-normal">Last 20 runs</CardDescription>
      </CardHeader>
      <CardContent
        className="min-h-0 flex-1 space-y-0 overflow-y-scroll overscroll-y-contain px-4 py-3 sm:px-5"
        data-app-scroll
      >
        {runsLoading && !runsIsError ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="divide-y divide-border/80">
            {runs?.map((run) => (
              <li key={run.id} className="flex flex-col gap-2.5 py-3.5 first:pt-2 sm:py-3 sm:first:pt-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="neutral" className="text-[10px] sm:text-[11px]">
                      {run.type}
                    </Badge>
                    <Badge variant={statusVariant(run.status)} className="text-[10px] sm:text-[11px]">
                      {run.status}
                    </Badge>
                  </div>
                  <span className="text-xs tabular-nums leading-relaxed text-muted-foreground sm:text-[11px] sm:leading-snug">
                    <span className="block sm:hidden">{formatDuration(run.duration)}</span>
                    <span className="block sm:hidden">{new Date(run.createdAt).toLocaleString()}</span>
                    <span className="hidden sm:inline">
                      {formatDuration(run.duration)} · {new Date(run.createdAt).toLocaleString()}
                    </span>
                  </span>
                </div>
                {run.error && (
                  <p className="rounded-md bg-error-muted/40 px-2 py-1.5 text-xs leading-snug text-error-foreground sm:text-[11px]">
                    {run.error}
                  </p>
                )}
              </li>
            ))}
            {runsIsSuccess && runs && runs.length === 0 && (
              <li className="py-12 text-center text-sm text-muted-foreground">No runs yet.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
