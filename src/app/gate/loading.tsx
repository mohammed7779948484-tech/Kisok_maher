import { Skeleton } from '@/shared/ui'

export default function GateLoading(): React.ReactElement {
  return (
    <main aria-busy="true" className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-dialog rounded-extra-large border border-outline-variant bg-surface p-8 shadow-elevation-1">
        <Skeleton className="mx-auto h-16 w-48" />
        <Skeleton className="mt-8 h-field w-full" />
        <Skeleton className="mt-4 h-prominent w-full" />
        <span className="sr-only" role="status">Loading access screen</span>
      </div>
    </main>
  )
}
