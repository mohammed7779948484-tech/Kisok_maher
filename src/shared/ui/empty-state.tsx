import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface EmptyStateProps {
  action?: ReactNode
  className?: string
  description: string
  icon: LucideIcon
  title: string
}

export function EmptyState({ action, className, description, icon: Icon, title }: EmptyStateProps): React.ReactElement {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-large border border-dashed border-outline-variant bg-surface-container-low px-6 py-12 text-center', className)}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-container text-neutral" aria-hidden="true">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="text-title-medium text-on-surface">{title}</h2>
      <p className="mt-2 max-w-md text-body-medium text-on-surface-variant">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
