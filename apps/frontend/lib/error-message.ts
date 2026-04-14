import axios from 'axios'

/**
 * Maps unknown failures to short, non-sensitive UI copy.
 */
export function getUserFacingErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as { message?: unknown } | undefined
    const msg = data?.message
    // Сначала стабильное сообщение с API (Nest кладёт его в body), потом общие фолбэки.
    if (typeof msg === 'string' && msg.length > 0 && msg.length < 240) return msg
    if (status && status >= 500) return 'Server error. Please try again.'
    if (status === 404) return 'Not found.'
    if (typeof error.message === 'string' && error.message.length > 0) return error.message
    return fallback
  }
  if (error instanceof Error && error.message.length > 0) return error.message
  return fallback
}
