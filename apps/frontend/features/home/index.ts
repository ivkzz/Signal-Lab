/** Клиент и ключи запросов. Не реэкспортируйте `HomePage` отсюда — тянет server-only prefetch в client/vitest. */
export { default as HomeDashboard } from './home-dashboard'
export { dashboardQueryKeys } from '@/lib/dashboard-query-keys'
