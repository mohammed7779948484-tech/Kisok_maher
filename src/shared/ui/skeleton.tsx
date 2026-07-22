import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/utils'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-medium bg-surface-container-high', className)} {...props} />
}
