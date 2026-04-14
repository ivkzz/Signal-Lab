import 'server-only'

import type { HealthPayload, ScenarioRun } from '@/features/home/types'

export function getServerApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
}

export async function fetchInitialHealth(): Promise<
  { ok: true; data: HealthPayload } | { ok: false }
> {
  const base = getServerApiBaseUrl().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/health`, { cache: 'no-store' })
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as HealthPayload
    return { ok: true, data }
  } catch {
    return { ok: false }
  }
}

export async function fetchInitialScenarioRuns(): Promise<
  { ok: true; data: ScenarioRun[] } | { ok: false }
> {
  const base = getServerApiBaseUrl().replace(/\/$/, '')
  try {
    const res = await fetch(`${base}/scenarios`, { cache: 'no-store' })
    if (!res.ok) return { ok: false }
    const data = (await res.json()) as ScenarioRun[]
    return { ok: true, data: Array.isArray(data) ? data : [] }
  } catch {
    return { ok: false }
  }
}
