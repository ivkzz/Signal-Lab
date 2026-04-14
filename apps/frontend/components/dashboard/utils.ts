import type { ScenarioType } from './types'

export type HealthStateClass = 'loading' | 'ok' | 'error' | 'degraded' | 'unknown'

export function statusVariant(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  if (status === 'completed') return 'success'
  if (status === 'warning' || status === 'teapot') return 'warning'
  if (status === 'error') return 'error'
  return 'neutral'
}

export function scenarioDescription(type: ScenarioType): string {
  if (type === 'success') return 'Successful flow with normal completion'
  if (type === 'validation_error') return 'Expected domain validation warning'
  if (type === 'system_error') return 'Critical failure with Sentry signal'
  if (type === 'slow_request') return 'Simulated latency for duration metrics'
  return 'Intentional teapot status scenario'
}

export function formatDuration(duration: number | null): string {
  if (duration === null) return 'n/a'
  return `${duration} ms`
}

export function healthStateClass(params: {
  isError: boolean
  isLoading: boolean
  status?: string
}): HealthStateClass {
  if (params.isError) return 'error'
  if (params.isLoading) return 'loading'
  if (params.status === 'ok') return 'ok'
  if (params.status) return 'degraded'
  return 'unknown'
}

export function healthLiveTextForClass(healthClass: HealthStateClass): string {
  const map: Record<HealthStateClass, string> = {
    loading: 'Checking backend health.',
    ok: 'Backend reported a healthy status.',
    error: 'Backend health check failed.',
    degraded: 'Backend responded, but status is not healthy.',
    unknown: 'Backend health status is unknown.',
  }
  return map[healthClass]
}
