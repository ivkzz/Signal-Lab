export type ScenarioRunLike = {
  status: string
}

/**
 * KPI values are intentionally withheld until the first successful fetch completes,
 * so operators do not read "0" as a fact while data is still loading.
 */
export function formatKpiValue(value: number, dataReady: boolean): string {
  if (!dataReady) return '—'
  return String(value)
}

export function countRunsByStatus(runs: ScenarioRunLike[] | undefined, status: string): number {
  if (!runs) return 0
  return runs.filter((run) => run.status === status).length
}
