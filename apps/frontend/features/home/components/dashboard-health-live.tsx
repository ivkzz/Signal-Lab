'use client'

import type { HealthStateClass } from '@/features/home/utils'
import { healthLiveTextForClass } from '@/features/home/utils'

type DashboardHealthLiveProps = {
  healthClass: HealthStateClass
}

export function DashboardHealthLive({ healthClass }: DashboardHealthLiveProps) {
  return (
    <div aria-live="polite" className="sr-only" role="status">
      {healthLiveTextForClass(healthClass)}
    </div>
  )
}
