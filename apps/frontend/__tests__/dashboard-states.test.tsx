import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HomeDashboard } from '@/features/home'

vi.mock('@/lib/api', () => {
  const pending = () =>
    new Promise(() => {
      /* never resolves — keeps scenario runs query pending */
    })

  return {
    default: {
      get: vi.fn((url: string) => {
        if (url === '/health') return Promise.resolve({ data: { status: 'ok' } })
        if (url === '/scenarios') return pending()
        return Promise.reject(new Error(`unexpected ${url}`))
      }),
      post: vi.fn(),
    },
  }
})

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('Dashboard loading states', () => {
  it('does not show numeric KPI zeros while runs are still loading', async () => {
    renderWithClient(<HomeDashboard />)

    expect(await screen.findByText('Loading…')).toBeInTheDocument()

    const kpiRegion = screen.getByRole('region', { name: /overview/i })
    expect(kpiRegion.textContent).not.toMatch(/\b0\b/)
    expect(kpiRegion.textContent).toContain('—')
  })
})
