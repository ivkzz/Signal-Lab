import { describe, expect, it } from 'vitest'
import { countRunsByStatus, formatKpiValue } from '@/lib/dashboard-metrics'

describe('formatKpiValue', () => {
  it('returns an em dash until data is ready', () => {
    expect(formatKpiValue(0, false)).toBe('—')
    expect(formatKpiValue(12, false)).toBe('—')
  })

  it('returns numeric string when data is ready', () => {
    expect(formatKpiValue(0, true)).toBe('0')
    expect(formatKpiValue(7, true)).toBe('7')
  })
})

describe('countRunsByStatus', () => {
  it('counts matching statuses', () => {
    const runs = [{ status: 'completed' }, { status: 'error' }, { status: 'completed' }]
    expect(countRunsByStatus(runs, 'completed')).toBe(2)
    expect(countRunsByStatus(runs, 'error')).toBe(1)
  })

  it('returns 0 when runs are undefined', () => {
    expect(countRunsByStatus(undefined, 'completed')).toBe(0)
  })
})
