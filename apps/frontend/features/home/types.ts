/** Ответ `GET /health` — общий тип для серверного prefetch и клиентского `useQuery`. */
export type HealthPayload = { status: string }

export type ScenarioType = 'success' | 'validation_error' | 'system_error' | 'slow_request' | 'teapot'

export type ScenarioFormValues = {
  type: ScenarioType
  name?: string
}

export type ScenarioRun = {
  id: string
  type: string
  status: string
  duration: number | null
  error: string | null
  createdAt: string
}

export const SCENARIO_TYPES: ScenarioType[] = [
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot',
]

export type WorkspaceTab = 'form' | 'history'
