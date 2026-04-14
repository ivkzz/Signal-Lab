import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import HomeDashboard from '@/features/home/home-dashboard'
import { makeHomeServerQueryClient, prefetchHomeDashboard } from '@/features/home/server/prefetch-home-dashboard'

export default async function HomePage() {
  const queryClient = makeHomeServerQueryClient()
  await prefetchHomeDashboard(queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeDashboard />
    </HydrationBoundary>
  )
}
