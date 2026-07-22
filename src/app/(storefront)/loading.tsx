import { Skeleton } from '@/shared/ui'
import { brandConfig } from '@/shared/config'

export default function StorefrontLoading(): React.ReactElement {
  return (
    <div aria-busy="true" aria-label="Loading page" className="customer-shell">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 max-w-md" />
        <Skeleton className="h-6 max-w-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 medium:grid-cols-3 expanded:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="overflow-hidden rounded-large border border-outline-variant bg-surface p-4" key={index}>
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-3 h-4 w-1/2" />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">Loading {brandConfig.displayName} catalog</span>
    </div>
  )
}
