import React from 'react'

/** Adapted from Maher/components/ui/skeleton.tsx. */
export function AdminSkeleton({ className = '' }: { className?: string }): React.ReactElement {
  return <div aria-hidden="true" className={`dragon-skeleton ${className}`} />
}
export function ProductsTableSkeleton(): React.ReactElement {
  return (
    <div aria-label="Loading products and flavors" className="dragon-skeleton-panel" role="status">
      <div className="grid gap-3 md:grid-cols-3">
        <AdminSkeleton className="h-10 md:col-span-2" />
        <AdminSkeleton className="h-10" />
      </div>
      {[0, 1, 2].map((item) => (
        <div className="dragon-skeleton-row" key={item}>
          <AdminSkeleton className="h-12 w-12" />
          <div className="grid flex-1 gap-2"><AdminSkeleton className="h-4 w-48 max-w-full" /><AdminSkeleton className="h-3 w-28 max-w-full" /></div>
          <AdminSkeleton className="hidden h-8 w-24 sm:block" />
        </div>
      ))}
      <span className="sr-only">Loading products and flavors…</span>
    </div>
  )
}
