'use client'

import type { HealthStateClass } from './utils'
import { healthLiveTextForClass } from './utils'

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
