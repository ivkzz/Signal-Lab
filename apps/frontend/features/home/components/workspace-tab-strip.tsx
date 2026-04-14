'use client'

import type { WorkspaceTab } from '@/features/home/types'
import { cn } from '@/lib/utils'

type WorkspaceTabStripProps = {
  tab: WorkspaceTab
  onChange: (tab: WorkspaceTab) => void
  className?: string
}

export function WorkspaceTabStrip({ tab, onChange, className }: WorkspaceTabStripProps) {
  return (
    <div
      className={cn(
        'flex w-full shrink-0 gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5 lg:hidden',
        className,
      )}
      role="tablist"
      aria-label="Workspace"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'form'}
        className={cn(
          'min-h-11 flex-1 rounded-md px-2 py-2.5 text-sm font-medium transition-colors',
          tab === 'form' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onChange('form')}
      >
        Scenario
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'history'}
        className={cn(
          'min-h-11 flex-1 rounded-md px-2 py-2.5 text-sm font-medium transition-colors',
          tab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onChange('history')}
      >
        History
      </button>
    </div>
  )
}
