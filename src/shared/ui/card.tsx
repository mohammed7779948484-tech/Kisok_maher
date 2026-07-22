import * as React from 'react'

import { cn } from '@/shared/lib/utils'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('premium-surface rounded-large border', className)} {...props} />
  )
)
Card.displayName = 'Card'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-5', className)} {...props} />
)
CardContent.displayName = 'CardContent'
