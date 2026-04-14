import { describe, expect, it } from 'vitest'
import { resolveObservabilityLinks } from '@/lib/observability-urls'

describe('resolveObservabilityLinks', () => {
  it('returns trimmed URLs when env keys are present', () => {
    const links = resolveObservabilityLinks({
      NEXT_PUBLIC_GRAFANA_URL: '  https://grafana.example  ',
      NEXT_PUBLIC_PROMETHEUS_URL: 'https://prom.example',
      NEXT_PUBLIC_BACKEND_METRICS_URL: 'https://api.example/metrics',
    })

    expect(links).toEqual({
      grafana: 'https://grafana.example',
      prometheus: 'https://prom.example',
      backendMetrics: 'https://api.example/metrics',
    })
  })

  it('returns null for missing or blank values', () => {
    const links = resolveObservabilityLinks({
      NEXT_PUBLIC_GRAFANA_URL: '',
      NEXT_PUBLIC_PROMETHEUS_URL: '   ',
    })

    expect(links.grafana).toBeNull()
    expect(links.prometheus).toBeNull()
    expect(links.backendMetrics).toBeNull()
  })
})
