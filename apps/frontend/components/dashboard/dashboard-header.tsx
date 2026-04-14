'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUserFacingErrorMessage } from '@/lib/error-message'

export type ObservabilityNavEntry = {
  label: string
  href: string | null
}

type DashboardHeaderProps = {
  health: { status: string } | undefined
  healthLoading: boolean
  healthIsError: boolean
  healthError: unknown
  onRetryHealth: () => void
  observabilityEntries: readonly ObservabilityNavEntry[]
}

export function DashboardHeader({
  health,
  healthLoading,
  healthIsError,
  healthError,
  onRetryHealth,
  observabilityEntries,
}: DashboardHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Signal Lab</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Observability playground</p>
      </div>

      <div className="flex flex-col items-start gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ThemeToggle />
          <span className="text-muted-foreground">API</span>
          <Badge
            variant={health?.status === 'ok' ? 'success' : healthIsError ? 'error' : 'neutral'}
            aria-label={`Backend health: ${healthLoading ? 'checking' : healthIsError ? 'error' : health?.status ?? 'unknown'}`}
          >
            {healthLoading ? 'checking' : healthIsError ? 'error' : health?.status ?? 'unknown'}
          </Badge>
          {healthIsError && (
            <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={() => void onRetryHealth()}>
              Retry
            </Button>
          )}
        </div>
        {healthIsError && (
          <p className="max-w-md text-right text-xs text-destructive sm:text-right">{getUserFacingErrorMessage(healthError)}</p>
        )}

        <nav aria-label="Observability tools" className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {observabilityEntries.map((entry, i) => (
            <span key={entry.label} className="flex items-center gap-x-3">
              {i > 0 && (
                <span className="text-border" aria-hidden>
                  |
                </span>
              )}
              {entry.href ? (
                <a
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {entry.label}
                </a>
              ) : (
                <span className="text-muted-foreground/70">{entry.label} —</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  )
}
