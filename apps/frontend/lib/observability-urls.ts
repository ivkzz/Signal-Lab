/**
 * Observability deep links for the dashboard.
 *
 * NEXT_PUBLIC_* — в корневом `.env` или `.env.local` репозитория; шаблон переменных — корневой `.env.example`.
 * When a URL is missing, the UI should hide the control or show "Not configured" — do not
 * silently fall back to localhost in production builds.
 *
 * Important (Next.js): `NEXT_PUBLIC_*` must be read via **literal** `process.env.NEXT_PUBLIC_*`
 * in `getObservabilityLinks`. Dynamic access like `process.env[key]` is not inlined into the
 * client bundle and causes SSR/client hydration mismatches.
 */
export type ObservabilityLinks = {
  grafana: string | null
  prometheus: string | null
  backendMetrics: string | null
}

type PublicEnvSlice = {
  NEXT_PUBLIC_GRAFANA_URL?: string
  NEXT_PUBLIC_PROMETHEUS_URL?: string
  NEXT_PUBLIC_BACKEND_METRICS_URL?: string
}

function pickUrl(raw: string | undefined): string | null {
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  return trimmed.length > 0 ? trimmed : null
}

/** For tests — inject a custom env slice without touching `process.env`. */
export function resolveObservabilityLinks(env: PublicEnvSlice): ObservabilityLinks {
  return {
    grafana: pickUrl(env.NEXT_PUBLIC_GRAFANA_URL),
    prometheus: pickUrl(env.NEXT_PUBLIC_PROMETHEUS_URL),
    backendMetrics: pickUrl(env.NEXT_PUBLIC_BACKEND_METRICS_URL),
  }
}

export function getObservabilityLinks(): ObservabilityLinks {
  return resolveObservabilityLinks({
    NEXT_PUBLIC_GRAFANA_URL: process.env.NEXT_PUBLIC_GRAFANA_URL,
    NEXT_PUBLIC_PROMETHEUS_URL: process.env.NEXT_PUBLIC_PROMETHEUS_URL,
    NEXT_PUBLIC_BACKEND_METRICS_URL: process.env.NEXT_PUBLIC_BACKEND_METRICS_URL,
  })
}
