'use client'

import { useState } from 'react'
import {
  DashboardHeader,
  DashboardMetrics,
  HistoryCard,
  ScenarioFormCard,
  WorkspaceTabStrip,
} from '@/features/home/components'
import type { WorkspaceTab } from '@/features/home/types'

/** Склеивает блоки дашборда; данные и мутации живут внутри соответствующих компонентов + общий `queryKey` в кэше TanStack Query. */
export default function HomeDashboard() {
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('history')

  const switchToHistoryOnMobileAfterRun = () => {
    if (typeof window.matchMedia !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      setWorkspaceTab('history')
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 md:gap-5 md:px-6 md:py-5">
        <DashboardHeader />

        <DashboardMetrics />

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:grid lg:min-h-0 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-0">
          <WorkspaceTabStrip tab={workspaceTab} onChange={setWorkspaceTab} />

          <ScenarioFormCard
            className="lg:col-span-1"
            workspaceTab={workspaceTab}
            onScenarioRan={switchToHistoryOnMobileAfterRun}
          />

          <HistoryCard className="lg:col-span-2" workspaceTab={workspaceTab} />
        </div>
      </div>
    </main>
  )
}
