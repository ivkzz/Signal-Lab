import path from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const monorepoRoot = path.resolve(__dirname, '..', '..')
Object.assign(process.env, loadEnv('test', monorepoRoot, ''))

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
