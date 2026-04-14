'use client'

import { Button } from '@/components/ui/button'
import { getUserFacingErrorMessage } from '@/lib/error-message'

type DashboardRunsErrorBannerProps = {
  error: unknown
  onRetry: () => void
}

export function DashboardRunsErrorBanner({ error, onRetry }: DashboardRunsErrorBannerProps) {
  return (
    <div
      className="flex shrink-0 flex-col gap-2 border-l-2 border-destructive bg-error-muted/60 py-2.5 pl-4 pr-3 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <span className="text-sm text-error-foreground">{getUserFacingErrorMessage(error, 'Could not load runs.')}</span>
      <Button type="button" variant="secondary" className="h-8 shrink-0 self-start sm:self-auto" onClick={() => void onRetry()}>
        Retry
      </Button>
    </div>
  )
}
